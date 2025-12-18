# Interactive Event Seating Map

A React-based interactive seating map application for event venues. Built with TypeScript and optimized for performance and accessibility.

## Overview

This application provides an interactive seating visualization system that allows users to:

- View venue layouts with multiple sections and rows
- Select seats through mouse clicks or keyboard navigation
- See real-time pricing and selection summaries
- Maintain selections across page reloads
- Access the interface on desktop and mobile devices

## Features

### Core Functionality

- **Interactive Seat Selection**: Click or use keyboard to select up to 8 seats
- **Visual Feedback**: Selected seats display with distinct styling and animations
- **Real-time Summary**: Live cart showing selected seats with pricing
- **Persistent State**: Selections saved to localStorage and restored on reload
- **Keyboard Navigation**: Full arrow key navigation with Enter/Space selection
- **Accessibility**: WCAG 2.1 AA compliant with ARIA labels and screen reader support

### Performance

- Optimized rendering for venues with 15,000+ seats
- Component memoization to prevent unnecessary re-renders
- Efficient state management with minimal updates
- Smooth 60fps animations and interactions

### Responsive Design

- Desktop: Full-featured layout with sidebar
- Tablet: Optimized medium-screen layout
- Mobile: Touch-friendly interface with stacked components

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The application will start at `http://localhost:5173`

### Building for Production

```bash
pnpm build
pnpm preview
```

## Technology Stack

- **React 19**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with strict mode
- **Zustand**: Lightweight state management library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

## Project Structure

```
src/
├── components/
│   ├── SeatingMap/
│   │   ├── SeatingMap.tsx      # Main container component
│   │   ├── Section.tsx         # Section wrapper with transform
│   │   ├── SeatRow.tsx         # Row of seats component
│   │   ├── Seat.tsx            # Individual seat component
│   │   └── SeatDetails.tsx      # Seat information panel
│   ├── SelectionSummary/
│   │   └── SelectionSummary.tsx # Selection cart component
│   └── UI/
│       └── Legend.tsx          # Status color legend
├── hooks/
│   ├── useVenueData.ts         # Loads venue data from JSON
│   └── useKeyboardNav.ts       # Keyboard navigation logic
├── stores/
│   └── seatStore.ts            # Zustand store with persistence
├── types/
│   └── venue.ts                # TypeScript type definitions
├── utils/
│   └── pricing.ts              # Price tier utilities
└── App.tsx                     # Root application component
```

## Component Architecture

### SeatingMap Component

The main container that renders the SVG seating map. Handles:
- SVG viewport and coordinate system
- Stage visualization
- Section rendering
- Click event delegation
- Seat details panel management

### Section Component

Wraps a venue section with transform positioning. Each section:
- Applies coordinate transforms for positioning
- Renders section label
- Contains multiple SeatRow components

### SeatRow Component

Renders a single row of seats. Maps seat data to Seat components.

### Seat Component

Individual seat rendering with:
- SVG circle element
- Status-based styling
- Click and keyboard event handling
- Focus management
- Accessibility attributes

### SeatDetails Component

Displays detailed information about a selected seat:
- Section, row, and seat number
- Price tier information
- Status display
- Close functionality

### SelectionSummary Component

Shopping cart-like summary showing:
- List of selected seats
- Individual seat prices
- Total price calculation
- Selection count (max 8)
- Clear and remove actions

## State Management

The application uses Zustand for state management with localStorage persistence.

### Store Structure

```typescript
interface SeatStore {
  venue: Venue | null;
  selectedSeats: Map<string, SeatSelection>;
  focusedSeatId: string | null;
  
  // Actions
  setVenue: (venue: Venue) => void;
  selectSeat: (seat: Seat, section: Section, row: Row) => boolean;
  deselectSeat: (seatId: string) => void;
  clearSelection: () => void;
  setFocusedSeat: (seatId: string | null) => void;
  getSeatStatus: (seatId: string) => SeatStatus;
  canSelectSeat: (seat: Seat) => boolean;
  getSelectionSummary: () => SelectionSummary;
}
```

### Persistence

Seat selections are automatically persisted to localStorage using Zustand's persist middleware. The Map structure is serialized/deserialized for storage.

## Data Structure

### Venue Configuration

Venue data is loaded from `public/venue.json`:

```typescript
interface Venue {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  sections: Section[];
}

interface Section {
  id: string;
  label: string;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  rows: Row[];
}

interface Row {
  index: number;
  seats: Seat[];
}

interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: SeatStatus;
}
```

### Price Tiers

Price tiers are defined in `src/utils/pricing.ts`:

- Tier 1: Standard - $75
- Tier 2: Premium - $125
- Tier 3: VIP - $250

## Styling

The application uses Tailwind CSS with custom seat status colors:

- **Available**: Green (`#10B981`)
- **Selected**: Blue (`#3B82F6`) with pulse animation
- **Reserved**: Amber (`#F59E0B`)
- **Sold**: Red (`#EF4444`)
- **Held**: Violet (`#8B5CF6`)

Custom CSS classes handle seat styling and focus indicators for SVG elements.

## Accessibility

### Keyboard Navigation

- **Tab**: Move focus between seats
- **Arrow Keys**: Navigate between adjacent seats
- **Enter/Space**: Select/deselect focused seat
- **Escape**: Close seat details panel

### Screen Reader Support

- All seats have descriptive `aria-label` attributes
- `aria-pressed` indicates selection state
- `aria-disabled` marks non-selectable seats
- Focus indicators are visible and accessible

### Focus Management

- SVG-based focus rings positioned correctly within transforms
- High contrast focus indicators
- Logical tab order through seating sections

## Performance Optimizations

### Component Memoization

Components use `React.memo` with custom comparison functions to prevent unnecessary re-renders:

```typescript
export const Seat = memo(SeatComponent, (prevProps, nextProps) => {
  return (
    prevProps.seat.id === nextProps.seat.id &&
    prevProps.seat.status === nextProps.seat.status &&
    prevProps.priceTier?.price === nextProps.priceTier?.price
  );
});
```

### Efficient Re-rendering

- Only selected seats trigger re-renders
- State updates are batched
- Map-based selection storage for O(1) lookups

### Rendering Strategy

- SVG rendering for scalable graphics
- Transform-based positioning for efficient updates
- Minimal DOM manipulation

## Development Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build optimized production bundle
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint for code quality

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing Recommendations

### Manual Testing Checklist

1. **Seat Selection**
   - Select seats by clicking
   - Select seats using keyboard (Tab + Enter/Space)
   - Verify maximum 8 seats limit
   - Test deselection

2. **Persistence**
   - Select seats and refresh page
   - Verify selections are restored
   - Clear localStorage and verify reset

3. **Accessibility**
   - Navigate using only keyboard
   - Test with screen reader
   - Verify focus indicators are visible

4. **Responsive Design**
   - Test on mobile device sizes
   - Verify touch interactions work
   - Check layout on tablet sizes

5. **Performance**
   - Test with large venue data (15,000+ seats)
   - Monitor frame rate during interactions
   - Check memory usage over time

## Configuration

### Venue Data

Modify `public/venue.json` to change venue layout. The structure supports:
- Multiple sections with independent transforms
- Variable rows per section
- Variable seats per row
- Custom price tiers per seat

### Price Tiers

Update `src/utils/pricing.ts` to modify price tier definitions.

## Troubleshooting

### Seats Not Rendering

- Verify `venue.json` is valid JSON
- Check browser console for errors
- Ensure seat coordinates are within map bounds

### Selections Not Persisting

- Check browser localStorage is enabled
- Verify Zustand persist middleware is working
- Check browser console for storage errors

### Performance Issues

- Reduce number of seats in venue data
- Check for unnecessary re-renders in React DevTools
- Verify component memoization is working

## Production Deployment

### Build Process

```bash
pnpm build
```

This creates an optimized production bundle in the `dist/` directory.

### Environment Variables

No environment variables are currently required. All configuration is in `venue.json`.

### Deployment Considerations

- Serve `dist/` directory as static files
- Ensure `venue.json` is accessible
- Configure proper caching headers
- Enable gzip compression for assets
