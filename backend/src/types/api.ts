import { CacheStats } from './cache';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  timestamp: number;
}

export interface CacheStatusResponse {
  success: true;
  data: CacheStats;
  timestamp: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number | undefined;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burstCapacity: number;
  burstWindowMs: number;
}
