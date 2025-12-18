import { useState, useEffect } from 'react';
import type { Venue } from '../types/venue';
import { useSeatStore } from '../stores/seatStore';

export const useVenueData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { venue, setVenue } = useSeatStore();

  useEffect(() => {
    const loadVenue = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/venue.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch venue data: ${response.statusText}`);
        }

        const venueData: Venue = await response.json();
        setVenue(venueData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error loading venue data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!venue) {
      loadVenue();
    } else {
      setLoading(false);
    }
  }, [venue, setVenue]);

  return { venue, loading, error };
};
