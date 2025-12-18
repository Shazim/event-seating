import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse, CacheStatusResponse } from '../types/api';

export class CacheController {
  constructor(private userService: UserService) {}

  async getCacheStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = this.userService.getCacheStats();
      
      const response: CacheStatusResponse = {
        success: true,
        data: stats,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async clearCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.userService.clearCache();
      
      const response: ApiResponse = {
        success: true,
        message: 'Cache cleared successfully',
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
