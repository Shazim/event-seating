import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Services
import { LRUCache } from './services/cacheService';
import { UserService } from './services/userService';

// Middleware
import { RateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { loggerMiddleware, logger } from './middleware/logger';

// Controllers
import { UserController } from './controllers/userController';
import { CacheController } from './controllers/cacheController';

// Types
import { ApiResponse } from './types/api';

const PORT = process.env.PORT || 3001;

class App {
  public app: Application;
  private cache!: LRUCache<any>;
  private userService!: UserService;
  private userController!: UserController;
  private cacheController!: CacheController;
  private rateLimiter!: RateLimiter;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeServices(): void {
    // Initialize cache with 60s TTL, max 1000 entries, cleanup every 30s
    this.cache = new LRUCache({
      maxSize: 1000,
      ttlMs: 60000,
      cleanupIntervalMs: 30000,
    });

    this.userService = new UserService(this.cache);
    this.userController = new UserController(this.userService);
    this.cacheController = new CacheController(this.userService);

    // Rate limiter: 10 req/min with 5 burst in 10s
    this.rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 10,
      burstCapacity: 5,
      burstWindowMs: 10000, // 10 seconds
    });
  }

  private initializeMiddleware(): void {
    // Basic middleware
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);

    // Custom middleware
    this.app.use(loggerMiddleware);
    this.app.use(this.rateLimiter.middleware());
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      const response: ApiResponse = {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
        timestamp: Date.now(),
      };
      res.json(response);
    });

    // User routes
    this.app.get('/users/:id', this.userController.getUserById.bind(this.userController));
    this.app.post('/users', this.userController.createUser.bind(this.userController));

    // Cache management routes
    this.app.get('/cache-status', this.cacheController.getCacheStatus.bind(this.cacheController));
    this.app.delete('/cache', this.cacheController.clearCache.bind(this.cacheController));

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      const loggerStats = logger.getStats();
      const rateLimiterStats = this.rateLimiter.getStats();
      const cacheStats = this.userService.getCacheStats();

      const response: ApiResponse = {
        success: true,
        data: {
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
          },
          requests: loggerStats,
          rateLimit: rateLimiterStats,
          cache: cacheStats,
        },
        timestamp: Date.now(),
      };

      res.json(response);
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`🚀 Advanced Express API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`👤 Users API: http://localhost:${PORT}/users/:id`);
      console.log(`🗄️  Cache status: http://localhost:${PORT}/cache-status`);
    });
  }

  public stop(): void {
    // Cleanup resources
    this.cache.destroy();
    this.rateLimiter.destroy();
    console.log('🛑 Server stopped and resources cleaned up');
  }
}

// Handle graceful shutdown
const app = new App();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  app.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  app.stop();
  process.exit(0);
});

// Start the server
app.start();

export default app;
