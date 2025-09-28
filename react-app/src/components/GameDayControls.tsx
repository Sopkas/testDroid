import React, { useContext, useState } from 'react';
import { PTSDataContext } from '../context/PTSDataContext';
import './GameDayControls.css';

const GameDayControls: React.FC = () => {
  const context = useContext(PTSDataContext);
  if (!context) {
    throw new Error('GameDayControls must be used within a PTSDataProvider');
  }

  const { currentDay, setCurrentDay, gameDays, setGameDays, currentPTS, setCurrentPTS } = context;
  const [startPTS, setStartPTS] = useState<string>('');
  const [endPTS, setEndPTS] = useState<string>('');
  const [matchesCount, setMatchesCount] = useState<string>('');
  const [winsCount, setWinsCount] = useState<string>('');
  
  const [useDetailedInput, setUseDetailedInput] = useState<boolean>(false);

  const startGameDay = () => {
    if (currentDay) {
      alert('Игровой день уже начат!');
      return;
    }
    
    if (!startPTS || isNaN(Number(startPTS))) {
      alert('Введите корректный начальный PTS!');
      return;
    }
    
    const newDay = {
      date: new Date(),
      startDate: new Date(),
      startTimePTS: parseInt(startPTS),
      matches: [],
      isComplete: false
    };
    
    setCurrentDay(newDay);
    setStartPTS('');
    alert('Игровой день начат!');
  };

  const endGameDaySimple = () => {
    if (!currentDay) {
      alert('Сначала начните игровой день!');
      return;
    }
    
    if (!endPTS || isNaN(Number(endPTS))) {
      alert('Введите корректный конечный PTS!');
      return;
    }
    
    if (!matchesCount || isNaN(Number(matchesCount)) || parseInt(matchesCount) < 0) {
      alert('Введите корректное количество матчей!');
      return;
    }
    
    if (!winsCount || isNaN(Number(winsCount)) || parseInt(winsCount) < 0) {
      alert('Введите корректное количество побед!');
      return;
    }
    
    if (parseInt(winsCount) > parseInt(matchesCount)) {
      alert('Количество побед не может превышать количество матчей!');
      return;
    }
    
    const completedDay = {
      ...currentDay,
      endDate: new Date(),
      endTimePTS: parseInt(endPTS),
      isComplete: true,
    };
    
    // Calculate day stats based on simple input
    const matches = parseInt(matchesCount);
    const wins = parseInt(winsCount);
    const losses = matches - wins;
    const winrate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
    
    const dayWithStats = {
      ...completedDay,
      matchesCount: matches,
      wins: wins,
      losses: losses,
      winrate: winrate,
      ptsChange: parseInt(endPTS) - currentDay.startTimePTS
    };

    // Add to game days
    setGameDays(prev => [...prev, dayWithStats]);
    
    // Update current PTS
    setCurrentPTS(parseInt(endPTS));
    
    // Reset current day
    setCurrentDay(null);
    setEndPTS('');
    setMatchesCount('');
    setWinsCount('');
    
    alert('Игровой день завершен!');
  };

  const endGameDayDetailed = () => {
    if (!currentDay) {
      alert('Сначала начните игровой день!');
      return;
    }
    
    if (!endPTS || isNaN(Number(endPTS))) {
      alert('Введите корректный конечный PTS!');
      return;
    }
    
    const completedDay = {
      ...currentDay,
      endDate: new Date(),
      endTimePTS: parseInt(endPTS),
      isComplete: true,
    };
    
    // Calculate day stats from detailed input
    const matchesCount = completedDay.matches ? completedDay.matches.length : 0;
    const wins = completedDay.matches ? 
      completedDay.matches.filter((m: any) => m.result === 'win').length : 0;
    const losses = completedDay.matches ? 
      completedDay.matches.filter((m: any) => m.result === 'loss').length : 0;
    const winrate = matchesCount > 0 ? Math.round((wins / matchesCount) * 100) : 0;
    
    const dayWithStats = {
      ...completedDay,
      matchesCount,
      wins,
      losses,
      winrate,
      ptsChange: completedDay.endTimePTS - completedDay.startTimePTS
    };

    // Add to game days
    setGameDays(prev => [...prev, dayWithStats]);
    
    // Update current PTS
    setCurrentPTS(parseInt(endPTS));
    
    // Reset current day
    setCurrentDay(null);
    setEndPTS('');
    
    alert('Игровой день завершен!');
  };

  return (
    <section id="game-day-controls" className="controls-section">
      <h2 className="controls-title">Игровой день</h2>
      <div className="controls">
        {!currentDay ? (
          <div className="start-controls">
            <input
              type="number"
              value={startPTS}
              onChange={(e) => setStartPTS(e.target.value)}
              placeholder="Начальный PTS"
              className="pts-input"
            />
            <button 
              onClick={startGameDay} 
              className="btn btn-primary"
            >
              Начать игровой день
            </button>
          </div>
        ) : (
          <div className="end-controls">
            <div className="simple-input">
              <input
                type="number"
                value={endPTS}
                onChange={(e) => setEndPTS(e.target.value)}
                placeholder="Конечный PTS"
                className="pts-input"
              />
              
              {!useDetailedInput ? (
                <>
                  <input
                    type="number"
                    value={matchesCount}
                    onChange={(e) => setMatchesCount(e.target.value)}
                    placeholder="Всего матчей"
                    className="pts-input"
                  />
                  <input
                    type="number"
                    value={winsCount}
                    onChange={(e) => setWinsCount(e.target.value)}
                    placeholder="Побед"
                    className="pts-input"
                  />
                  <button 
                    onClick={endGameDaySimple} 
                    className="btn btn-secondary"
                  >
                    Завершить день (простой ввод)
                  </button>
                  <button 
                    onClick={() => setUseDetailedInput(true)} 
                    className="btn btn-tertiary"
                  >
                    Вводить матчи по одному
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={endGameDayDetailed} 
                    className="btn btn-secondary"
                  >
                    Завершить день (подробный ввод)
                  </button>
                  <button 
                    onClick={() => setUseDetailedInput(false)} 
                    className="btn btn-tertiary"
                  >
                    Простой ввод
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GameDayControls;