# Express.js User Data API

A high-performance Express.js API server with advanced caching, rate limiting, and asynchronous processing capabilities. Built with TypeScript for type safety and production readiness.

## Overview

This API provides user data management with sophisticated performance optimizations:

- Custom LRU cache implementation with TTL expiration
- Advanced rate limiting with burst capacity handling
- Request deduplication for concurrent requests
- Performance monitoring and metrics collection
- Comprehensive error handling and logging

## Features

### Caching

- **LRU Cache**: Custom implementation with O(1) operations
- **TTL Expiration**: 60-second time-to-live for cached entries
- **Background Cleanup**: Automatic removal of expired entries
- **Statistics Tracking**: Cache hit/miss rates and performance metrics

### Rate Limiting

- **Sliding Window**: 10 requests per minute per IP address
- **Burst Handling**: Allows 5 requests in a 10-second burst window
- **Automatic Cleanup**: Expired rate limit records are removed automatically
- **Clear Error Messages**: Rate limit responses include retry-after headers

### Request Optimization

- **Deduplication**: Concurrent requests for the same resource share a single database call
- **Promise-based**: Waiting requests receive the same result as the initiating request
- **Memory Efficient**: Pending request maps are cleaned up after completion

### Monitoring

- **Health Checks**: `/health` endpoint for service status
- **Metrics**: `/metrics` endpoint with detailed performance statistics
- **Request Logging**: Comprehensive logging with response times
- **Error Tracking**: Structured error logging for debugging

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The server starts on `http://localhost:3001`

### Production Build

```bash
pnpm build
pnpm start
```

## API Endpoints

### User Management

#### GET /users/:id

Retrieves a user by ID. Responses are cached for 60 seconds.

**Parameters:**
- `id` (path parameter): User ID (number)

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Performance:**
- Cache hit: < 10ms response time
- Cache miss: ~200ms (simulated database delay)

#### POST /users

Creates a new user.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "id": 6,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Cache Management

#### DELETE /cache

Clears the entire cache.

**Response:**
```json
{
  "message": "Cache cleared successfully",
  "clearedEntries": 5
}
```

#### GET /cache-status

Returns cache statistics.

**Response:**
```json
{
  "size": 5,
  "maxSize": 100,
  "hits": 150,
  "misses": 25,
  "hitRate": 0.857,
  "averageResponseTime": 12.5
}
```

### Monitoring

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /metrics

Returns detailed performance metrics.

**Response:**
```json
{
  "server": {
    "uptime": 3600,
    "memoryUsage": {
      "heapUsed": 52428800,
      "heapTotal": 104857600
    }
  },
  "requests": {
    "total": 175,
    "averageResponseTime": 45.2,
    "errorRate": 0.02
  },
  "rateLimiting": {
    "totalRequests": 175,
    "blockedRequests": 3
  },
  "cache": {
    "hits": 150,
    "misses": 25,
    "hitRate": 0.857
  }
}
```

## Architecture

### Project Structure

```
src/
├── controllers/
│   ├── userController.ts    # User route handlers
│   └── cacheController.ts    # Cache management routes
├── middleware/
│   ├── rateLimiter.ts       # Rate limiting middleware
│   ├── errorHandler.ts      # Error handling middleware
│   └── logger.ts            # Request logging middleware
├── services/
│   ├── cacheService.ts      # LRU cache implementation
│   └── userService.ts       # User data business logic
├── types/
│   ├── user.ts              # User type definitions
│   ├── cache.ts             # Cache type definitions
│   └── api.ts               # API response types
├── utils/
│   └── mockData.ts          # Mock user data
└── index.ts                 # Application entry point
```

### Cache Service

The cache service implements a Least Recently Used (LRU) cache with the following characteristics:

- **Data Structure**: Doubly-linked list with hash map for O(1) operations
- **Capacity**: Configurable maximum size (default: 100 entries)
- **TTL**: 60-second expiration for all entries
- **Operations**:
  - `get(key)`: O(1) retrieval, updates LRU order
  - `set(key, value)`: O(1) insertion, evicts least recently used if at capacity
  - `clear()`: Removes all entries
  - `getStats()`: Returns cache statistics

### Rate Limiter Middleware

Implements sliding window rate limiting with burst capacity:

- **Main Limit**: 10 requests per minute per IP
- **Burst Limit**: 5 requests per 10-second window
- **Tracking**: Per-IP timestamp arrays
- **Cleanup**: Automatic removal of expired timestamps
- **Headers**: Rate limit information in response headers

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1234567890
Retry-After: 30
```

### Request Deduplication

Prevents duplicate database calls for concurrent requests:

1. First request initiates database call and stores promise
2. Subsequent requests wait for the same promise
3. All requests receive the same result
4. Promise is cleaned up after completion

This optimization is particularly effective for high-traffic endpoints.

### Error Handling

Comprehensive error handling throughout the application:

- **Validation Errors**: 400 Bad Request with descriptive messages
- **Not Found**: 404 with appropriate error format
- **Rate Limit**: 429 Too Many Requests with retry-after
- **Server Errors**: 500 with error logging
- **Structured Responses**: Consistent error response format

## Usage Examples

### Basic User Retrieval

```bash
curl http://localhost:3001/users/1
```

### Create User

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

### Check Cache Status

```bash
curl http://localhost:3001/cache-status
```

### Clear Cache

```bash
curl -X DELETE http://localhost:3001/cache
```

### View Metrics

```bash
curl http://localhost:3001/metrics
```

## Performance Testing

### Cache Performance

Test cache hit performance:

```bash
# First request (cache miss, ~200ms)
time curl http://localhost:3001/users/1

# Second request (cache hit, <10ms)
time curl http://localhost:3001/users/1
```

### Rate Limiting

Test rate limit enforcement:

```bash
# Make 12 requests rapidly (should block after 10)
for i in {1..12}; do
  curl http://localhost:3001/users/1
  echo
done
```

### Burst Limiting

Test burst capacity:

```bash
# Make 6 concurrent requests (should block after 5 in 10s)
for i in {1..6}; do
  curl http://localhost:3001/users/1 &
done
wait
```

### Request Deduplication

Test concurrent request deduplication:

```bash
# Make 10 concurrent requests for same user
for i in {1..10}; do
  curl http://localhost:3001/users/1 &
done
wait
```

Check logs to verify only one database call was made.

## Configuration

### Cache Configuration

Modify cache settings in `src/services/cacheService.ts`:

```typescript
const DEFAULT_TTL = 60000; // 60 seconds
const DEFAULT_MAX_SIZE = 100; // Maximum cache entries
const CLEANUP_INTERVAL = 30000; // 30 seconds
```

### Rate Limit Configuration

Modify rate limit settings in `src/middleware/rateLimiter.ts`:

```typescript
const REQUESTS_PER_MINUTE = 10;
const BURST_REQUESTS = 5;
const BURST_WINDOW_MS = 10000; // 10 seconds
```

### Server Configuration

Modify server settings in `src/index.ts`:

```typescript
const PORT = process.env.PORT || 3001;
```

## Monitoring

### Health Checks

The `/health` endpoint can be used for:
- Load balancer health checks
- Container orchestration health probes
- Monitoring system integration

### Metrics Collection

The `/metrics` endpoint provides:
- Server uptime and memory usage
- Request statistics (count, average response time, error rate)
- Rate limiting statistics
- Cache performance metrics

These metrics can be integrated with monitoring systems like Prometheus or Datadog.

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Production Considerations

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

### Graceful Shutdown

The server handles SIGTERM and SIGINT signals:
- Stops accepting new requests
- Waits for in-flight requests to complete
- Cleans up resources
- Exits gracefully

### Memory Management

- Automatic cleanup of expired cache entries
- Automatic cleanup of expired rate limit records
- Background cleanup runs every 30 seconds
- No memory leaks in long-running processes

### Logging

Request logging includes:
- Timestamp
- HTTP method and path
- Status code
- Response time
- IP address
- User agent

Error logging includes:
- Error message
- Stack trace
- Request context

## Development

### TypeScript Configuration

Strict mode is enabled with:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `exactOptionalPropertyTypes: true`

### Code Quality

- ESLint for linting
- TypeScript for type checking
- Consistent code formatting
- Comprehensive error handling

### Testing

Manual testing can be performed using curl commands or API testing tools like Postman or Insomnia.

## Troubleshooting

### High Memory Usage

- Check cache size and TTL settings
- Verify cleanup intervals are running
- Monitor rate limit record cleanup

### Rate Limiting Issues

- Verify IP address detection is working correctly
- Check rate limit configuration values
- Review rate limit cleanup intervals

### Cache Not Working

- Verify cache service is initialized
- Check TTL expiration logic
- Review cache statistics endpoint

### Performance Issues

- Monitor cache hit rates
- Check for memory leaks
- Review request deduplication effectiveness
- Analyze metrics endpoint data

## Mock Data

The server includes pre-populated users (IDs 1-5) for testing. These are stored in memory and can be accessed immediately. New users created via POST are also stored in memory and cached automatically.
