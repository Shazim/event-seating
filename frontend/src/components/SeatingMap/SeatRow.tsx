import { memo } from 'react';
import type { Row, Section, Venue } from '../../types/venue';
import { Seat } from './Seat';
import { getPriceTier } from '../../utils/pricing';

interface SeatRowProps {
  row: Row;
  section: Section;
  venue: Venue;
}

const SeatRowComponent: React.FC<SeatRowProps> = ({ row, section }) => {
  return (
    <g className="seat-row" data-row-index={row.index}>
      {row.seats.map((seat) => {
        const priceTier = getPriceTier(seat.priceTier);
        
        return (
          <Seat
            key={seat.id}
            seat={seat}
            section={section}
            row={row}
            priceTier={priceTier}
          />
        );
      })}
    </g>
  );
};

// Memoize to prevent unnecessary re-renders of entire rows
export const SeatRow = memo(SeatRowComponent, (prevProps, nextProps) => {
  return (
    prevProps.row.index === nextProps.row.index &&
    prevProps.section.id === nextProps.section.id &&
    prevProps.row.seats.length === nextProps.row.seats.length
  );
});
