import { useVenueData } from './hooks/useVenueData';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { SeatingMap } from './components/SeatingMap/SeatingMap';
import { SelectionSummary } from './components/SelectionSummary/SelectionSummary';
import { Legend } from './components/UI/Legend';

function App() {
  const { venue, loading, error } = useVenueData();
  
  // Initialize keyboard navigation
  useKeyboardNav();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue data...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-fit">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Venue</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Failed to load venue data. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
              <p className="text-sm text-gray-600">Select your seats</p>
            </div>
            <div className="text-sm text-gray-500">
              Venue ID: {venue.venueId}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Seating Map - Takes up 3/4 of the width on large screens */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <SeatingMap venue={venue} />
            </div>
            
            {/* Legend - Show below map on smaller screens */}
            <div className="mt-4">
              <Legend />
            </div>
          </div>

          {/* Sidebar - Takes up 1/4 of the width on large screens */}
          <div className="lg:col-span-1 space-y-4">
            <SelectionSummary />
            
            {/* Additional Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-2">How to Select</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>🖱️ Click seats to select/deselect</p>
                <p>⌨️ Use arrow keys to navigate</p>
                <p>↵ Press Enter/Space to select</p>
                <p>📱 Touch-friendly on mobile</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Interactive Event Seating Map - Built with React + TypeScript</p>
            <p className="mt-1">
              Supports keyboard navigation, screen readers, and mobile devices
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;