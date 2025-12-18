import React from 'react';
import type { Seat, Section, Row } from '../../types/venue';
import { useSeatStore } from '../../stores/seatStore';

interface SeatDetailsProps {
  seat: Seat;
  section: Section;
  row: Row;
  priceTier: { name: string; price: number };
  onClose: () => void;
}

export const SeatDetails: React.FC<SeatDetailsProps> = ({
  seat,
  section,
  row,
  priceTier,
  onClose,
}) => {
  const { selectSeat, getSeatStatus, canSelectSeat } = useSeatStore();

  const seatStatus = getSeatStatus(seat.id);
  const isSelectable = canSelectSeat(seat);

  const handleSelect = () => {
    if (isSelectable) {
      selectSeat(seat, section, row);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available', color: 'text-green-600' };
      case 'selected':
        return { text: 'Selected', color: 'text-blue-600' };
      case 'reserved':
        return { text: 'Reserved', color: 'text-amber-600' };
      case 'sold':
        return { text: 'Sold', color: 'text-red-600' };
      case 'held':
        return { text: 'Held', color: 'text-violet-600' };
      default:
        return { text: 'Unknown', color: 'text-gray-600' };
    }
  };

  const statusInfo = getStatusDisplay(seatStatus);

  return (
    <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-64 z-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-900">Seat Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
          aria-label="Close seat details"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Seat Information */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Section:</span>
          <span className="font-medium">{section.label}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Row:</span>
          <span className="font-medium">{row.index}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Seat:</span>
          <span className="font-medium">{seat.col}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Price Tier:</span>
          <span className="font-medium">{priceTier.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Price:</span>
          <span className="font-medium text-green-600">${priceTier.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
        </div>
      </div>

      {/* Action Button */}
      {isSelectable && (
        <button
          onClick={handleSelect}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            seatStatus === 'selected'
              ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label={seatStatus === 'selected' ? 'Deselect seat' : 'Select seat'}
        >
          {seatStatus === 'selected' ? 'Deselect Seat' : 'Select Seat'}
        </button>
      )}

      {!isSelectable && seatStatus !== 'selected' && (
        <div className="text-sm text-gray-500 text-center">
          This seat is not available for selection
        </div>
      )}
    </div>
  );
};
