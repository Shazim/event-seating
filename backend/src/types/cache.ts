export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
}

export interface CacheNode<T> {
  key: string;
  value: CacheEntry<T>;
  prev: CacheNode<T> | null;
  next: CacheNode<T> | null;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageResponseTime: number;
  totalRequests: number;
}

export interface CacheConfig {
  maxSize: number;
  ttlMs: number;
  cleanupIntervalMs: number;
}
