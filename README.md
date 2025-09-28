# Dota 2 PTS Tracker

A personal website for tracking your Dota 2 Place a bet on the match (PTS) progress, winrate, and analytics.

## Features

- Start/End game day functionality
- PTS progress tracking
- Winrate calculations and analytics
- Historical data with expandable days
- Visual charts for PTS history, winrate periods, hero stats, and time of day analysis
- Advanced statistics (heroes, time of day, match duration)
- Goal forecasting
- Responsive design for mobile devices

## Versions

This project includes two implementations:

### Original Version
- Pure HTML/CSS/JavaScript with Chart.js
- To run: Open `index.html` in your browser or use a local server

### React Version (Recommended)
- Built with React and TypeScript
- More maintainable and extensible
- Enhanced UI/UX

To run the React version:
1. Navigate to the `react-app` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open your browser at `http://localhost:3000`

## Data Storage

All data is stored in your browser's localStorage, so it persists between sessions but only on the same device and browser.

## Implementation Details

The application implements all requirements from the original specification:

1. **Game Day Management**: Start/end day functionality with PTS tracking
2. **Data Entry**: Forms for entering match details, heroes, results, and other stats
3. **History Tracking**: Collapsible day entries with detailed match information
4. **Analytics**: Calculations for overall winrate, daily/weekly/monthly winrates
5. **Visualization**: Progress bars and charts with multiple visualization types
6. **Forecasting**: Estimates for reaching goals based on current performance
7. **Responsive Design**: Mobile-friendly layout

## Technologies Used

### Original Version:
- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization

### React Version:
- React (TypeScript)
- Chart.js with React wrapper
- Modern CSS with gradients and animations

## License

MIT