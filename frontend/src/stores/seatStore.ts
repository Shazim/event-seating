import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Venue, Seat, SeatSelection, SelectionSummary, Section, Row } from '../types/venue';
import { getPriceTier } from '../utils/pricing';

interface SeatStore {
  // Data
  venue: Venue | null;
  selectedSeats: Map<string, SeatSelection>;
  focusedSeat: Seat | null;
  
  // Actions
  setVenue: (venue: Venue) => void;
  selectSeat: (seat: Seat, section: Section, row: Row) => boolean;
  deselectSeat: (seatId: string) => void;
  setFocusedSeat: (seat: Seat | null) => void;
  clearSelection: () => void;
  
  // Computed
  getSelectionSummary: () => SelectionSummary;
  getSeatStatus: (seatId: string) => 'available' | 'reserved' | 'sold' | 'held' | 'selected';
  canSelectSeat: (seat: Seat) => boolean;
}

export const useSeatStore = create<SeatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      venue: null,
      selectedSeats: new Map(),
      focusedSeat: null,

      // Actions
      setVenue: (venue) => {
        set({ venue });
      },

      selectSeat: (seat, section, row) => {
        const { selectedSeats, canSelectSeat } = get();
        
        if (!canSelectSeat(seat)) {
          return false;
        }

        // Check if already selected
        if (selectedSeats.has(seat.id)) {
          // Already selected, deselect it
          get().deselectSeat(seat.id);
          return true;
        }

        // Check selection limit (max 8 seats)
        if (selectedSeats.size >= 8) {
          return false;
        }

        const newSelection: SeatSelection = { seat, section, row };
        const newSelectedSeats = new Map(selectedSeats);
        newSelectedSeats.set(seat.id, newSelection);

        set({ selectedSeats: newSelectedSeats });
        return true;
      },

      deselectSeat: (seatId) => {
        const { selectedSeats } = get();
        const newSelectedSeats = new Map(selectedSeats);
        newSelectedSeats.delete(seatId);
        set({ selectedSeats: newSelectedSeats });
      },

      setFocusedSeat: (seat) => {
        set({ focusedSeat: seat });
      },

      clearSelection: () => {
        set({ selectedSeats: new Map() });
      },

      // Computed values
      getSelectionSummary: () => {
        const { selectedSeats } = get();
        const seats = Array.from(selectedSeats.values());
        
        // Filter out any corrupted selections and calculate price
        const validSeats = seats.filter(selection => selection?.seat?.priceTier);
        const totalPrice = validSeats.reduce((sum, selection) => {
          const priceTier = getPriceTier(selection.seat.priceTier);
          return sum + priceTier.price;
        }, 0);

        return {
          seats: validSeats,
          totalPrice,
          count: validSeats.length,
        };
      },

      getSeatStatus: (seatId) => {
        const { selectedSeats, venue } = get();
        
        if (selectedSeats.has(seatId)) {
          return 'selected';
        }

        // Find the seat in venue data
        if (venue) {
          for (const section of venue.sections) {
            for (const row of section.rows) {
              const seat = row.seats.find(s => s.id === seatId);
              if (seat) {
                return seat.status;
              }
            }
          }
        }

        return 'available';
      },

      canSelectSeat: (seat) => {
        const { selectedSeats } = get();
        
        // Can't select if already at max capacity (unless deselecting)
        if (selectedSeats.size >= 8 && !selectedSeats.has(seat.id)) {
          return false;
        }

        // Can't select non-available seats (but can deselect selected ones)
        if (selectedSeats.has(seat.id)) {
          return true; // Can deselect
        }

        return seat.status === 'available';
      },
    }),
    {
      name: 'seat-selection-storage',
      // Only persist the selected seats, not the entire venue data
      partialize: (state) => ({ 
        selectedSeats: Array.from(state.selectedSeats.entries()) 
      }),
      // Handle Map serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              selectedSeats: new Map(parsed.state.selectedSeats || []),
            },
          };
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              selectedSeats: Array.from(value.state.selectedSeats.entries()),
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
