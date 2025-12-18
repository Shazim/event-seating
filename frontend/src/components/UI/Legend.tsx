import React from 'react';

interface LegendProps {
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({ className = '' }) => {
  const legendItems = [
    { status: 'available', color: '#10B981', label: 'Available' },
    { status: 'selected', color: '#3B82F6', label: 'Selected' },
    { status: 'reserved', color: '#F59E0B', label: 'Reserved' },
    { status: 'sold', color: '#EF4444', label: 'Sold' },
    { status: 'held', color: '#8B5CF6', label: 'Held' },
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold text-sm text-gray-900 mb-3">Legend</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {legendItems.map(({ status, color, label }) => (
          <div key={status} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>
      
      {/* Usage instructions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Click seats to select/deselect. Use arrow keys for keyboard navigation. Up to 8 seats maximum.
        </p>
      </div>
    </div>
  );
};
