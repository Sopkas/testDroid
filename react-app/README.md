# Dota 2 PTS Tracker (React Version)

A personal website for tracking your Dota 2 Place a bet on the match (PTS) progress, winrate, and analytics built with React.

## Features

- Start/End game day functionality
- PTS progress tracking
- Winrate calculations and analytics
- Historical data with expandable days
- Visual charts for PTS history, winrate periods, hero stats, and time of day analysis
- Advanced statistics (heroes, time of day, match duration)
- Goal forecasting
- Responsive design for mobile devices

## How to Run

1. Make sure you have Node.js installed
2. Navigate to this directory: `cd react-app`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Open your browser at `http://localhost:3000`

## Data Storage

All data is stored in your browser's localStorage, so it persists between sessions but only on the same device and browser.

## Technologies Used

- React (TypeScript)
- Chart.js with React wrapper
- CSS Modules for styling

## Project Structure

- `src/App.tsx` - Main application component
- `src/context/PTSDataContext.ts` - Context for managing application state
- `src/components/` - React components for different sections
  - `Dashboard.tsx` - Progress and stats overview
  - `GameDayControls.tsx` - Start/end day controls
  - `AdvancedStats.tsx` - Form for adding match details
  - `ChartsSection.tsx` - All data visualization charts
  - `HistorySection.tsx` - Historical game day records

## License

MIT