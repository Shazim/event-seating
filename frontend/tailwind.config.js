/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        seat: {
          available: '#10B981', // green-500
          selected: '#3B82F6',  // blue-500
          reserved: '#F59E0B',  // amber-500
          sold: '#EF4444',      // red-500
          held: '#8B5CF6',      // violet-500
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
