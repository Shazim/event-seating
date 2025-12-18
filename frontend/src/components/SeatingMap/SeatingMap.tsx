import { memo, useState, useCallback } from 'react';
import type { Venue, Seat, Section as SectionType, Row } from '../../types/venue';
import { Section } from './Section';
import { SeatDetails } from './SeatDetails';
import { getPriceTier, type PriceTierInfo } from '../../utils/pricing';

interface SeatingMapProps {
  venue: Venue;
  className?: string;
}

const SeatingMapComponent: React.FC<SeatingMapProps> = ({ venue, className = '' }) => {
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<{
    seat: Seat;
    section: SectionType;
    row: Row;
    priceTier: PriceTierInfo;
  } | null>(null);

  const handleSeatClick = useCallback((event: React.MouseEvent<SVGElement>) => {
    const target = event.target as SVGElement;
    const seatId = target.getAttribute('data-seat-id');
    
    if (seatId) {
      // Find seat details
      for (const section of venue.sections) {
        for (const row of section.rows) {
          const seat = row.seats.find(s => s.id === seatId);
          if (seat) {
            const priceTier = getPriceTier(seat.priceTier);
            setSelectedSeatDetails({ seat, section, row, priceTier });
            return;
          }
        }
      }
    }
  }, [venue]);

  const handleMapClick = useCallback((event: React.MouseEvent<SVGElement>) => {
    // Close seat details if clicking on empty space
    if (event.target === event.currentTarget) {
      setSelectedSeatDetails(null);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main seating map */}
      <svg
        width={venue.map.width}
        height={venue.map.height}
        viewBox={`0 0 ${venue.map.width} ${venue.map.height}`}
        className="w-full h-auto border border-gray-300 bg-white"
        role="img"
        aria-label={`Seating map for ${venue.name}`}
        onClick={handleMapClick}
      >
        {/* Background */}
        <rect
          width={venue.map.width}
          height={venue.map.height}
          fill="white"
          stroke="none"
        />
        
        {/* Stage/Performance area indicator */}
        <rect
          x={venue.map.width * 0.3}
          y={venue.map.height * 0.05}
          width={venue.map.width * 0.4}
          height={20}
          fill="#f3f4f6"
          stroke="#9ca3af"
          rx={4}
        />
        <text
          x={venue.map.width * 0.5}
          y={venue.map.height * 0.05 + 14}
          className="fill-gray-600 text-xs font-medium"
          textAnchor="middle"
          aria-hidden="true"
        >
          STAGE
        </text>

        {/* Sections */}
        <g onClick={handleSeatClick}>
          {venue.sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              venue={venue}
            />
          ))}
        </g>

      </svg>

      {/* Seat details panel */}
      {selectedSeatDetails && (
        <SeatDetails
          {...selectedSeatDetails}
          onClose={() => setSelectedSeatDetails(null)}
        />
      )}
    </div>
  );
};

// Memoize the entire seating map to prevent unnecessary re-renders
export const SeatingMap = memo(SeatingMapComponent, (prevProps, nextProps) => {
  return (
    prevProps.venue.venueId === nextProps.venue.venueId &&
    prevProps.className === nextProps.className
  );
});
