import React, { memo, useCallback } from 'react';
import type { Seat as SeatType, Section, Row } from '../../types/venue';
import { useSeatStore } from '../../stores/seatStore';
import { useKeyboardNav } from '../../hooks/useKeyboardNav';

interface SeatProps {
  seat: SeatType;
  section: Section;
  row: Row;
  priceTier?: { name: string; price: number };
}

const SeatComponent: React.FC<SeatProps> = ({ seat, section, row, priceTier }) => {
  const { selectSeat, getSeatStatus, canSelectSeat } = useSeatStore();
  const { focusedSeat, setFocusedSeat } = useKeyboardNav();

  const seatStatus = getSeatStatus(seat.id);
  const isSelectable = canSelectSeat(seat);
  const isFocused = focusedSeat?.id === seat.id;

  const handleClick = useCallback(() => {
    if (isSelectable) {
      selectSeat(seat, section, row);
    }
  }, [seat, section, row, isSelectable, selectSeat]);

  const handleFocus = useCallback(() => {
    setFocusedSeat(seat);
  }, [seat, setFocusedSeat]);

  const handleBlur = useCallback(() => {
    // Don't clear focused seat on blur as keyboard navigation needs it
  }, []);

  // Generate seat label for accessibility
  const seatLabel = `Section ${section.label}, Row ${row.index}, Seat ${seat.col}`;
  const statusLabel = seatStatus === 'selected' ? 'selected' : seatStatus;
  const priceLabel = priceTier ? `$${priceTier.price}` : '';
  const ariaLabel = `${seatLabel}, ${statusLabel}${priceLabel ? `, ${priceLabel}` : ''}`;

  // Determine seat size and styling based on status
  const seatRadius = 6;
  
  return (
    <g>
      {/* Focus ring - SVG-based, positioned correctly */}
      {isFocused && (
        <circle
          cx={seat.x}
          cy={seat.y}
          r={seatRadius + 3}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          opacity="0.8"
          className="pointer-events-none"
        />
      )}
      
      {/* Actual seat circle */}
      <circle
        cx={seat.x}
        cy={seat.y}
        r={seatRadius}
        className={`seat seat-${seatStatus}`}
        data-seat-id={seat.id}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        aria-pressed={seatStatus === 'selected'}
        aria-disabled={!isSelectable}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleClick();
          }
        }}
        style={{
          cursor: isSelectable ? 'pointer' : 'not-allowed',
          opacity: isSelectable || seatStatus === 'selected' ? 1 : 0.6,
        }}
      />
    </g>
  );
};

// Memoize to prevent unnecessary re-renders
export const Seat = memo(SeatComponent, (prevProps, nextProps) => {
  return (
    prevProps.seat.id === nextProps.seat.id &&
    prevProps.seat.status === nextProps.seat.status &&
    prevProps.priceTier?.price === nextProps.priceTier?.price
  );
});
