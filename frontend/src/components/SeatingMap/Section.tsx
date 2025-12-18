import { memo } from 'react';
import type { Section as SectionType, Venue } from '../../types/venue';
import { SeatRow } from './SeatRow';

interface SectionProps {
  section: SectionType;
  venue: Venue;
}

const SectionComponent: React.FC<SectionProps> = ({ section, venue }) => {
  const { x, y, scale } = section.transform;

  return (
    <g
      className="section"
      data-section-id={section.id}
      transform={`translate(${x}, ${y}) scale(${scale})`}
    >
      {/* Section label */}
      <text
        x={0}
        y={-25}
        className="fill-gray-700 text-sm font-medium"
        textAnchor="start"
        aria-hidden="true"
      >
        {section.label}
      </text>
      
      {/* Rows */}
      {section.rows.map((row) => (
        <SeatRow
          key={`${section.id}-row-${row.index}`}
          row={row}
          section={section}
          venue={venue}
        />
      ))}
    </g>
  );
};

// Memoize to prevent unnecessary re-renders of entire sections
export const Section = memo(SectionComponent, (prevProps, nextProps) => {
  return (
    prevProps.section.id === nextProps.section.id &&
    prevProps.section.rows.length === nextProps.section.rows.length
  );
});
