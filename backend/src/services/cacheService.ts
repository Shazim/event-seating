import { CacheEntry, CacheNode, CacheStats, CacheConfig } from '../types/cache';

export class LRUCache<T> {
  private cache: Map<string, CacheNode<T>>;
  private head: CacheNode<T> | null;
  private tail: CacheNode<T> | null;
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout;
  private responseTimes: number[] = [];

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.head = null;
    this.tail = null;
    this.config = config;
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      totalRequests: 0,
    };

    // Start background cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupIntervalMs);
  }

  private addNode(node: CacheNode<T>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node);
    this.addNode(node);
  }

  private removeTail(): CacheNode<T> | null {
    if (!this.tail) return null;

    const lastNode = this.tail;
    this.removeNode(lastNode);
    return lastNode;
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttlMs;
  }

  private updateStats(hit: boolean, responseTime?: number): void {
    if (hit) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }

    this.stats.totalRequests++;
    this.stats.hitRate = this.stats.hits / this.stats.totalRequests;

    if (responseTime !== undefined) {
      this.responseTimes.push(responseTime);
      // Keep only last 1000 response times for rolling average
      if (this.responseTimes.length > 1000) {
        this.responseTimes.shift();
      }
      this.stats.averageResponseTime = 
        this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    }
  }

  get(key: string): T | null {
    const startTime = Date.now();
    const node = this.cache.get(key);

    if (!node || this.isExpired(node.value)) {
      if (node) {
        // Remove expired entry
        this.cache.delete(key);
        this.removeNode(node);
        this.stats.size--;
      }
      this.updateStats(false, Date.now() - startTime);
      return null;
    }

    // Update access info
    node.value.lastAccessed = Date.now();
    node.value.accessCount++;

    // Move to head (most recently used)
    this.moveToHead(node);

    this.updateStats(true, Date.now() - startTime);
    return node.value.data;
  }

  set(key: string, value: T): void {
    const existingNode = this.cache.get(key);
    const now = Date.now();

    if (existingNode) {
      // Update existing
      existingNode.value.data = value;
      existingNode.value.timestamp = now;
      existingNode.value.lastAccessed = now;
      existingNode.value.accessCount++;
      this.moveToHead(existingNode);
    } else {
      // Add new
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: now,
        lastAccessed: now,
        accessCount: 1,
      };

      const newNode: CacheNode<T> = {
        key,
        value: entry,
        prev: null,
        next: null,
      };

      this.cache.set(key, newNode);
      this.addNode(newNode);
      this.stats.size++;

      // Remove least recently used if over capacity
      if (this.stats.size > this.config.maxSize) {
        const tail = this.removeTail();
        if (tail) {
          this.cache.delete(tail.key);
          this.stats.size--;
        }
      }
    }
  }

  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.cache.delete(key);
    this.removeNode(node);
    this.stats.size--;
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.stats.size = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, node] of this.cache) {
      if (this.isExpired(node.value)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.delete(key);
    });
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}
