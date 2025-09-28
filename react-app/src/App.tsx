import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import GameDayControls from './components/GameDayControls';
import AdvancedStats from './components/AdvancedStats';
import ChartsSection from './components/ChartsSection';
import HistorySection from './components/HistorySection';
import { PTSDataContext } from './context/PTSDataContext';

const App: React.FC = () => {
  const [currentPTS, setCurrentPTS] = useState<number>(0);
  const [targetPTS, setTargetPTS] = useState<number>(10000);
  const [gameDays, setGameDays] = useState<any[]>([]);
  const [currentDay, setCurrentDay] = useState<any>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dotaPTStrackerData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setCurrentPTS(parsedData.currentPTS || 0);
      setTargetPTS(parsedData.targetPTS || 10000);
      setGameDays(parsedData.gameDays || []);
      setCurrentDay(parsedData.currentDay || null);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const data = {
      currentPTS,
      targetPTS,
      gameDays,
      currentDay
    };
    localStorage.setItem('dotaPTStrackerData', JSON.stringify(data));
  }, [currentPTS, targetPTS, gameDays, currentDay]);

  const contextValue = {
    currentPTS,
    setCurrentPTS,
    targetPTS,
    setTargetPTS,
    gameDays,
    setGameDays,
    currentDay,
    setCurrentDay
  };

  return (
    <PTSDataContext.Provider value={contextValue}>
      <div className="App">
        <header className="app-header">
          <h1>Dota 2 PTS Tracker</h1>
          <p>Отслеживание прогресса по PTS, winrate и аналитика</p>
        </header>
        
        <main className="app-main">
          <Dashboard />
          <GameDayControls />
          <AdvancedStats />
          <ChartsSection />
          <HistorySection />
        </main>
      </div>
    </PTSDataContext.Provider>
  );
};

export default App;