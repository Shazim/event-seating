import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent?: string | undefined;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  log(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log for real-time monitoring
    const { timestamp, method, path, statusCode, responseTime, ip } = entry;
    const logMessage = `[${timestamp}] ${ip} ${method} ${path} ${statusCode} ${responseTime}ms`;
    
    if (statusCode >= 500) {
      console.error(logMessage);
    } else if (statusCode >= 400) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  getLogs(limit?: number): LogEntry[] {
    const logs = limit ? this.logs.slice(-limit) : this.logs;
    return [...logs]; // Return copy
  }

  getStats() {
    const recentLogs = this.logs.slice(-1000); // Last 1000 requests
    
    if (recentLogs.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        requestsPerMinute: 0,
      };
    }

    const totalRequests = recentLogs.length;
    const averageResponseTime = recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests;
    const errorCount = recentLogs.filter(log => log.statusCode >= 400).length;
    const errorRate = errorCount / totalRequests;
    
    // Calculate requests per minute based on time range of recent logs
    const oldestLog = recentLogs[0];
    const newestLog = recentLogs[recentLogs.length - 1];
    const timeRangeMs = oldestLog && newestLog ? 
      new Date(newestLog.timestamp).getTime() - new Date(oldestLog.timestamp).getTime() : 0;
    const requestsPerMinute = timeRangeMs > 0 ? (totalRequests / (timeRangeMs / 60000)) : 0;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 10000) / 100, // Percentage with 2 decimals
      requestsPerMinute: Math.round(requestsPerMinute * 100) / 100,
    };
  }

  clear(): void {
    this.logs = [];
  }
}

// Singleton logger instance
export const logger = new Logger();

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Capture original end method
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const logEntry: LogEntry = {
      timestamp: new Date(startTime).toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || undefined,
    };

    logger.log(logEntry);
    
    // Call original end method with proper return
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};
