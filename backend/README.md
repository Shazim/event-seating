# Advanced Express.js API

Expert-Level Express.js API with advanced caching, rate limiting, and asynchronous processing.

## Features

- ✅ **LRU Cache Implementation**: Custom in-memory LRU cache with TTL and background cleanup
- ✅ **Sophisticated Rate Limiting**: Sliding window with burst capacity handling
- ✅ **Concurrent Request Optimization**: Deduplication for simultaneous requests to same resource
- ✅ **Performance Monitoring**: Real-time metrics and logging
- ✅ **TypeScript**: Full type safety with strict mode enabled
- ✅ **Graceful Error Handling**: Comprehensive error management
- ✅ **Request Logging**: Detailed request/response logging with performance metrics

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Core Endpoints

- `GET /users/:id` - Get user by ID (cached with 200ms DB simulation)
- `POST /users` - Create new user
- `DELETE /cache` - Clear entire cache
- `GET /cache-status` - Get cache statistics

### Monitoring Endpoints

- `GET /health` - Health check
- `GET /metrics` - Server performance metrics

## Architecture

### Caching Strategy

**LRU Cache with TTL**
- 60-second TTL for all cached data
- Background cleanup every 30 seconds
- Request deduplication prevents multiple DB calls for same resource
- Cache statistics tracking (hits, misses, average response time)

### Rate Limiting Strategy

**Sliding Window with Burst Handling**
- 10 requests per minute (main limit)
- 5 requests burst capacity in 10-second window
- Per-IP tracking with automatic cleanup
- Meaningful error responses with retry-after headers

### Performance Optimizations

1. **Request Deduplication**: Concurrent requests for same user ID share single DB call
2. **Memory Management**: Automatic cleanup of expired cache entries and rate limit records
3. **Response Caching**: All user data cached for 60 seconds
4. **Background Processing**: Non-blocking cleanup operations

## Testing the API

### Basic Usage

```bash
# Get user by ID
curl http://localhost:3001/users/1

# Create new user
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Check cache status
curl http://localhost:3001/cache-status

# View metrics
curl http://localhost:3001/metrics
```

### Performance Testing

```bash
# Test caching (first request slow, subsequent fast)
time curl http://localhost:3001/users/1
time curl http://localhost:3001/users/1

# Test rate limiting (exceed 10 requests/minute)
for i in {1..12}; do curl http://localhost:3001/users/1; echo; done

# Test burst limiting (exceed 5 requests in 10s)
for i in {1..6}; do curl http://localhost:3001/users/1 & done
```

## Implementation Details

### Cache Implementation

The LRU cache uses a doubly-linked list with hash map for O(1) operations:
- `get()`: O(1) retrieval with LRU ordering
- `set()`: O(1) insertion with capacity management
- Background TTL cleanup prevents memory leaks

### Rate Limiting Implementation

Sliding window algorithm with token bucket for burst handling:
- Tracks request timestamps per IP
- Automatic cleanup of expired tracking data
- Burst capacity allows temporary spikes
- Comprehensive rate limit headers

### Concurrent Request Handling

Request deduplication prevents duplicate database calls:
- Maps pending requests by cache key
- Subsequent requests wait for first completion
- All waiting requests receive cached result
- Automatic cleanup after completion

## Error Handling

- Input validation with meaningful error messages
- Proper HTTP status codes
- Structured error responses
- Request logging for debugging

## Monitoring & Metrics

The `/metrics` endpoint provides:
- Server uptime and memory usage
- Request statistics (total, avg response time, error rate)
- Rate limiting statistics
- Cache performance metrics

## Production Considerations

- Graceful shutdown handling (SIGTERM/SIGINT)
- Memory cleanup on shutdown
- Resource management with automatic cleanup
- Comprehensive logging for monitoring
- Type-safe error handling

## Mock Data

The server includes pre-populated users (IDs 1-5) for testing. New users created via POST endpoint are persisted in memory and cached automatically.
