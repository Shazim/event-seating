import React, { memo } from 'react';
import { useSeatStore } from '../../stores/seatStore';
import { getPriceTier } from '../../utils/pricing';

interface SelectionSummaryProps {
  className?: string;
}

const SelectionSummaryComponent: React.FC<SelectionSummaryProps> = ({ className = '' }) => {
  const { getSelectionSummary, clearSelection, deselectSeat } = useSeatStore();
  const summary = getSelectionSummary();

  if (summary.count === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <h3 className="font-semibold text-lg text-gray-900 mb-2">Your Selection</h3>
        <p className="text-gray-600 text-sm">No seats selected. Click on available seats to select up to 8 seats.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-900">
          Your Selection ({summary.count}/8)
        </h3>
        <button
          onClick={clearSelection}
          className="text-sm text-red-600 hover:text-red-800 underline"
          aria-label="Clear all selected seats"
        >
          Clear All
        </button>
      </div>

      {/* Selected Seats List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {summary.seats.map(({ seat, section, row }) => {
          const priceTier = getPriceTier(seat.priceTier);
          
          return (
            <div
              key={seat.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {section.label} - Row {row.index}, Seat {seat.col}
                </div>
                <div className="text-xs text-gray-600">
                  {priceTier?.name} · ${priceTier?.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => deselectSeat(seat.id)}
                className="ml-2 text-red-500 hover:text-red-700 p-1"
                aria-label={`Remove seat ${seat.col} from selection`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary Total */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span className="text-gray-900">Total:</span>
          <span className="text-green-600">${summary.totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {summary.count === 1 ? '1 seat selected' : `${summary.count} seats selected`}
          {summary.count < 8 && (
            <span className="ml-1">
              ({8 - summary.count} more available)
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        className="w-full mt-4 py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={summary.count === 0}
        aria-label={`Proceed with ${summary.count} selected seats`}
      >
        Continue with {summary.count} {summary.count === 1 ? 'Seat' : 'Seats'} - ${summary.totalPrice.toFixed(2)}
      </button>
    </div>
  );
};

export const SelectionSummary = memo(SelectionSummaryComponent);
