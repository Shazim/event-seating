# Event Seating Platform

A full-stack event seating management system consisting of an interactive frontend seating map and a high-performance backend API. Built with modern web technologies and production-ready architecture.

## Overview

This platform provides a complete solution for event seating management:

- **Frontend**: Interactive React-based seating map with real-time seat selection
- **Backend**: Express.js API with advanced caching, rate limiting, and performance monitoring

Both applications are independently deployable and communicate via REST APIs.

## Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm

### Installation

```bash
# Install frontend dependencies
cd frontend && pnpm install

# Install backend dependencies
cd ../backend && pnpm install
```

### Running the Applications

Start the backend server first:

```bash
cd backend
pnpm dev
```

The API will be available at `http://localhost:3001`

In a separate terminal, start the frontend:

```bash
cd frontend
pnpm dev
```

The application will be available at `http://localhost:5173`

## Architecture

### Frontend Application

The frontend is a React application built with TypeScript that renders an interactive seating map using SVG. It provides:

- Real-time seat selection with visual feedback
- Keyboard navigation for accessibility
- Persistent state management
- Responsive design for all device types
- Performance optimizations for large venue layouts

**Technology Stack:**
- React 19 with TypeScript
- Zustand for state management
- Tailwind CSS for styling
- Vite for build tooling

### Backend API

The backend is an Express.js server implementing advanced caching and rate limiting strategies:

- Custom LRU cache with TTL expiration
- Sliding window rate limiting with burst handling
- Request deduplication for concurrent requests
- Performance monitoring and metrics collection
- Comprehensive error handling

**Technology Stack:**
- Express.js with TypeScript
- Custom caching implementation
- Advanced rate limiting middleware
- Request logging and metrics

## Project Structure

```
event-seating/
├── frontend/                 # React seating map application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # State management
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utility functions
│   ├── public/
│   │   └── venue.json      # Venue configuration data
│   └── README.md           # Frontend documentation
│
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Helper utilities
│   └── README.md           # Backend documentation
│
└── README.md               # This file
```

## Features

### Frontend Features

- Interactive SVG-based seating visualization
- Seat selection with visual feedback (up to 8 seats)
- Full keyboard navigation support
- Accessibility compliance (WCAG 2.1 AA)
- Responsive design for desktop and mobile
- Persistent seat selection via localStorage
- Real-time pricing summary
- Performance optimized for 15,000+ seats

### Backend Features

- Custom LRU cache with 60-second TTL
- Rate limiting: 10 requests/minute with burst capacity
- Request deduplication for concurrent calls
- Performance metrics and monitoring
- Health check endpoints
- Graceful shutdown handling
- Comprehensive error handling

## API Endpoints

### User Management

- `GET /users/:id` - Retrieve user by ID (cached)
- `POST /users` - Create new user

### Cache Management

- `DELETE /cache` - Clear entire cache
- `GET /cache-status` - Get cache statistics

### Monitoring

- `GET /health` - Health check endpoint
- `GET /metrics` - Performance metrics

## Development

### Frontend Development

```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

### Backend Development

```bash
cd backend
pnpm dev          # Start development server with hot reload
pnpm build        # Compile TypeScript
pnpm start        # Run production build
```

## Testing

### Frontend Testing

1. Open the application in your browser
2. Test seat selection by clicking on available seats
3. Verify keyboard navigation using arrow keys and Enter/Space
4. Check mobile responsiveness by resizing the browser
5. Test persistence by refreshing the page after selecting seats

### Backend Testing

Test basic functionality:

```bash
curl http://localhost:3001/users/1
```

Test caching performance:

```bash
time curl http://localhost:3001/users/1  # First request (cache miss)
time curl http://localhost:3001/users/1  # Second request (cache hit)
```

Test rate limiting:

```bash
for i in {1..12}; do curl http://localhost:3001/users/1; done
```

View metrics:

```bash
curl http://localhost:3001/metrics
```

## Performance Characteristics

### Frontend Performance

- Handles 15,000+ seats with smooth 60fps rendering
- Initial load time under 2 seconds
- Seat selection response time under 16ms
- Optimized memory usage with component memoization

### Backend Performance

- Cache hits respond in under 10ms
- Cache misses simulate 200ms database delay
- Rate limiting tracks requests accurately
- Automatic memory cleanup prevents leaks
- Concurrent request deduplication prevents redundant processing

## Code Quality

Both applications follow strict quality standards:

- TypeScript strict mode enabled
- Comprehensive error handling
- Clean, maintainable architecture
- Performance optimizations throughout
- Production-ready code patterns
- Detailed inline documentation

## Documentation

- [Frontend Documentation](./frontend/README.md) - Complete frontend guide
- [Backend Documentation](./backend/README.md) - Complete backend guide

## License

This project is provided as-is for demonstration purposes.
