import { useEffect, useCallback } from 'react';
import type { Seat } from '../types/venue';
import { useSeatStore } from '../stores/seatStore';

export const useKeyboardNav = () => {
  const { venue, focusedSeat, setFocusedSeat, selectSeat } = useSeatStore();

  const findSeatById = useCallback((seatId: string) => {
    if (!venue) return null;

    for (const section of venue.sections) {
      for (const row of section.rows) {
        const seat = row.seats.find(s => s.id === seatId);
        if (seat) {
          return { seat, section, row };
        }
      }
    }
    return null;
  }, [venue]);

  const findAdjacentSeat = useCallback((
    currentSeat: Seat,
    direction: 'left' | 'right' | 'up' | 'down'
  ) => {
    if (!venue) return null;

    // Find current seat's section and row
    const current = findSeatById(currentSeat.id);
    if (!current) return null;

    const { section, row } = current;

    switch (direction) {
      case 'left': {
        // Previous seat in same row
        const currentIndex = row.seats.findIndex(s => s.id === currentSeat.id);
        if (currentIndex > 0) {
          return {
            seat: row.seats[currentIndex - 1],
            section,
            row,
          };
        }
        break;
      }

      case 'right': {
        // Next seat in same row
        const currentIndex = row.seats.findIndex(s => s.id === currentSeat.id);
        if (currentIndex < row.seats.length - 1) {
          return {
            seat: row.seats[currentIndex + 1],
            section,
            row,
          };
        }
        break;
      }

      case 'up': {
        // Same position in previous row
        const currentRowIndex = section.rows.findIndex(r => r.index === row.index);
        if (currentRowIndex > 0) {
          const prevRow = section.rows[currentRowIndex - 1];
          const currentCol = currentSeat.col;
          const targetSeat = prevRow.seats.find(s => s.col === currentCol) || 
                           prevRow.seats[Math.min(currentSeat.col - 1, prevRow.seats.length - 1)];
          if (targetSeat) {
            return {
              seat: targetSeat,
              section,
              row: prevRow,
            };
          }
        }
        break;
      }

      case 'down': {
        // Same position in next row
        const currentRowIndex = section.rows.findIndex(r => r.index === row.index);
        if (currentRowIndex < section.rows.length - 1) {
          const nextRow = section.rows[currentRowIndex + 1];
          const currentCol = currentSeat.col;
          const targetSeat = nextRow.seats.find(s => s.col === currentCol) || 
                           nextRow.seats[Math.min(currentSeat.col - 1, nextRow.seats.length - 1)];
          if (targetSeat) {
            return {
              seat: targetSeat,
              section,
              row: nextRow,
            };
          }
        }
        break;
      }
    }

    return null;
  }, [venue, findSeatById]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!focusedSeat) return;

    switch (event.key) {
      case 'ArrowLeft': {
        event.preventDefault();
        const adjacent = findAdjacentSeat(focusedSeat, 'left');
        if (adjacent) {
          setFocusedSeat(adjacent.seat);
          // Focus the DOM element
          const element = document.querySelector(`[data-seat-id="${adjacent.seat.id}"]`) as HTMLElement;
          element?.focus();
        }
        break;
      }

      case 'ArrowRight': {
        event.preventDefault();
        const adjacent = findAdjacentSeat(focusedSeat, 'right');
        if (adjacent) {
          setFocusedSeat(adjacent.seat);
          const element = document.querySelector(`[data-seat-id="${adjacent.seat.id}"]`) as HTMLElement;
          element?.focus();
        }
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        const adjacent = findAdjacentSeat(focusedSeat, 'up');
        if (adjacent) {
          setFocusedSeat(adjacent.seat);
          const element = document.querySelector(`[data-seat-id="${adjacent.seat.id}"]`) as HTMLElement;
          element?.focus();
        }
        break;
      }

      case 'ArrowDown': {
        event.preventDefault();
        const adjacent = findAdjacentSeat(focusedSeat, 'down');
        if (adjacent) {
          setFocusedSeat(adjacent.seat);
          const element = document.querySelector(`[data-seat-id="${adjacent.seat.id}"]`) as HTMLElement;
          element?.focus();
        }
        break;
      }

      case 'Enter':
      case ' ': {
        event.preventDefault();
        const current = findSeatById(focusedSeat.id);
        if (current) {
          selectSeat(current.seat, current.section, current.row);
        }
        break;
      }
    }
  }, [focusedSeat, findAdjacentSeat, setFocusedSeat, selectSeat, findSeatById]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedSeat,
    setFocusedSeat,
    findSeatById,
  };
};
