import { Request, Response, NextFunction } from 'express';
import { RateLimitConfig, RateLimitInfo } from '../types/api';

interface RequestRecord {
  requests: number[];
  burstRequests: number[];
}

export class RateLimiter {
  private requests: Map<string, RequestRecord>;
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.requests = new Map();
    this.config = config;

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private getClientKey(req: Request): string {
    // Use IP address as the key, could be extended to use API keys or user IDs
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const burstWindowStart = now - this.config.burstWindowMs;

    for (const [key, record] of this.requests) {
      // Remove old regular requests
      record.requests = record.requests.filter(timestamp => timestamp > windowStart);
      
      // Remove old burst requests
      record.burstRequests = record.burstRequests.filter(timestamp => timestamp > burstWindowStart);
      
      // Remove empty records
      if (record.requests.length === 0 && record.burstRequests.length === 0) {
        this.requests.delete(key);
      }
    }
  }

  private getRateLimitInfo(clientKey: string, now: number): RateLimitInfo {
    const windowStart = now - this.config.windowMs;
    const burstWindowStart = now - this.config.burstWindowMs;
    
    const record = this.requests.get(clientKey);
    
    if (!record) {
      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    // Count requests in current window
    const requestsInWindow = record.requests.filter(timestamp => timestamp > windowStart).length;
    const burstRequestsInWindow = record.burstRequests.filter(timestamp => timestamp > burstWindowStart).length;

    const remaining = Math.max(0, this.config.maxRequests - requestsInWindow);
    const resetTime = now + this.config.windowMs;

    let retryAfter: number | undefined;
    if (remaining === 0 || burstRequestsInWindow >= this.config.burstCapacity) {
      // Calculate when the client can make requests again
      const oldestRequest = Math.min(...record.requests);
      const oldestBurstRequest = record.burstRequests.length > 0 ? Math.min(...record.burstRequests) : 0;
      
      if (burstRequestsInWindow >= this.config.burstCapacity) {
        retryAfter = Math.ceil((oldestBurstRequest + this.config.burstWindowMs - now) / 1000);
      } else {
        retryAfter = Math.ceil((oldestRequest + this.config.windowMs - now) / 1000);
      }
    }

    return {
      limit: this.config.maxRequests,
      remaining,
      resetTime,
      retryAfter,
    };
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const now = Date.now();
      const clientKey = this.getClientKey(req);
      const windowStart = now - this.config.windowMs;
      const burstWindowStart = now - this.config.burstWindowMs;

      // Get or create client record
      let record = this.requests.get(clientKey);
      if (!record) {
        record = { requests: [], burstRequests: [] };
        this.requests.set(clientKey, record);
      }

      // Clean up old requests
      record.requests = record.requests.filter(timestamp => timestamp > windowStart);
      record.burstRequests = record.burstRequests.filter(timestamp => timestamp > burstWindowStart);

      const rateLimitInfo = this.getRateLimitInfo(clientKey, now);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitInfo.resetTime).toISOString(),
      });

      // Check burst capacity
      if (record.burstRequests.length >= this.config.burstCapacity) {
        if (rateLimitInfo.retryAfter) {
          res.set('Retry-After', rateLimitInfo.retryAfter.toString());
        }
        
        res.status(429).json({
          success: false,
          message: 'Too many requests in burst window. Please slow down.',
          error: 'RATE_LIMIT_BURST_EXCEEDED',
          timestamp: now,
          retryAfter: rateLimitInfo.retryAfter,
        });
        return;
      }

      // Check regular rate limit
      if (record.requests.length >= this.config.maxRequests) {
        if (rateLimitInfo.retryAfter) {
          res.set('Retry-After', rateLimitInfo.retryAfter.toString());
        }

        res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Maximum 10 requests per minute allowed.',
          error: 'RATE_LIMIT_EXCEEDED',
          timestamp: now,
          retryAfter: rateLimitInfo.retryAfter,
        });
        return;
      }

      // Record the request
      record.requests.push(now);
      record.burstRequests.push(now);

      next();
    };
  }

  getStats() {
    return {
      totalClients: this.requests.size,
      totalTrackedRequests: Array.from(this.requests.values()).reduce(
        (sum, record) => sum + record.requests.length,
        0
      ),
    };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}
