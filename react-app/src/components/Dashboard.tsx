import React, { useContext, useState } from 'react';
import { PTSDataContext } from '../context/PTSDataContext';
import './Dashboard.css';
import AdaptiveForecast from './AdaptiveForecast';
import AchievementBadges from './AchievementBadges';

const Dashboard: React.FC = () => {
  const context = useContext(PTSDataContext);
  if (!context) {
    throw new Error('Dashboard must be used within a PTSDataProvider');
  }

  const { currentPTS, targetPTS, setTargetPTS, gameDays, currentDay } = context;
  
  const [showSetTarget, setShowSetTarget] = useState(false);
  const [newTarget, setNewTarget] = useState(targetPTS.toString());

  // Calculate overall winrate
  let overallWinrate = 0;
  let totalMatches = 0;
  let totalWins = 0;

  // Count matches from completed days (both detailed and simple input)
  gameDays.forEach((day: any) => {
    if (day.matches && day.matches.length > 0) {
      // Detailed input: count from individual matches
      totalMatches += day.matches.length;
      day.matches.forEach((match: any) => {
        if (match.result === 'win') totalWins++;
      });
    } else if (day.matchesCount !== undefined && day.wins !== undefined) {
      // Simple input: use provided counts
      totalMatches += day.matchesCount;
      totalWins += day.wins;
    }
  });

  // Count matches from current day if it exists
  if (currentDay) {
    if (currentDay.matches && currentDay.matches.length > 0) {
      // Detailed input: count from individual matches
      totalMatches += currentDay.matches.length;
      currentDay.matches.forEach((match: any) => {
        if (match.result === 'win') totalWins++;
      });
    } else if (currentDay.matchesCount !== undefined && currentDay.wins !== undefined) {
      // Simple input: use provided counts
      totalMatches += currentDay.matchesCount;
      totalWins += currentDay.wins;
    }
  }

  if (totalMatches > 0) {
    overallWinrate = Math.round((totalWins / totalMatches) * 100);
  }

  // Calculate today's winrate
  let todayWinrate = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let todayMatches = 0;
  let todayWins = 0;
  
  // Check current day
  if (currentDay) {
    if (currentDay.matches && currentDay.matches.length > 0) {
      // Detailed input
      currentDay.matches.forEach((match: any) => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        if (matchDate.getTime() === today.getTime()) {
          todayMatches++;
          if (match.result === 'win') todayWins++;
        }
      });
    } else if (currentDay.date) {
      // Simple input: check if this day is today
      const dayDate = new Date(currentDay.date);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate.getTime() === today.getTime() && currentDay.matchesCount !== undefined) {
        todayMatches += currentDay.matchesCount;
        todayWins += currentDay.wins;
      }
    }
  }
  
  // Check completed days
  gameDays.forEach((day: any) => {
    if (day.matches && day.matches.length > 0) {
      // Detailed input
      day.matches.forEach((match: any) => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        if (matchDate.getTime() === today.getTime()) {
          todayMatches++;
          if (match.result === 'win') todayWins++;
        }
      });
    } else if (day.date) {
      // Simple input: check if this day is today
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate.getTime() === today.getTime() && day.matchesCount !== undefined) {
        todayMatches += day.matchesCount;
        todayWins += day.wins;
      }
    }
  });
  
  if (todayMatches > 0) {
    todayWinrate = Math.round((todayWins / todayMatches) * 100);
  }

  // Calculate weekly winrate
  let weeklyWinrate = 0;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  let weeklyMatches = 0;
  let weeklyWins = 0;
  
  // Check current day
  if (currentDay) {
    if (currentDay.matches && currentDay.matches.length > 0) {
      // Detailed input
      currentDay.matches.forEach((match: any) => {
        if (new Date(match.date) >= oneWeekAgo) {
          weeklyMatches++;
          if (match.result === 'win') weeklyWins++;
        }
      });
    } else if (currentDay.date) {
      // Simple input: check if day is within the week
      if (new Date(currentDay.date) >= oneWeekAgo && currentDay.matchesCount !== undefined) {
        weeklyMatches += currentDay.matchesCount;
        weeklyWins += currentDay.wins;
      }
    }
  }
  
  // Check completed days
  gameDays.forEach((day: any) => {
    if (day.matches && day.matches.length > 0) {
      // Detailed input
      day.matches.forEach((match: any) => {
        if (new Date(match.date) >= oneWeekAgo) {
          weeklyMatches++;
          if (match.result === 'win') weeklyWins++;
        }
      });
    } else if (day.date) {
      // Simple input: check if day is within the week
      if (new Date(day.date) >= oneWeekAgo && day.matchesCount !== undefined) {
        weeklyMatches += day.matchesCount;
        weeklyWins += day.wins;
      }
    }
  });
  
  if (weeklyMatches > 0) {
    weeklyWinrate = Math.round((weeklyWins / weeklyMatches) * 100);
  }

  // Calculate forecast
  let forecastDays = 'Нет данных';
  if (totalMatches > 0 && totalWins > 0) {
    const currentWinrate = totalWins / totalMatches;
    // Simplified estimation
    const ptsPerDayEstimate = currentWinrate * 20 + (1 - currentWinrate) * (-20); // +20 for win, -20 for loss
    if (ptsPerDayEstimate > 0) {
      const ptsNeeded = targetPTS - currentPTS;
      forecastDays = ptsNeeded > 0 ? `${Math.ceil(ptsNeeded / ptsPerDayEstimate)} дней` : 'Цель достигнута!';
    } else {
      forecastDays = 'Невозможно достичь цели';
    }
  }

  // Calculate progress percentage
  const progressPercent = targetPTS > 0 ? Math.min(100, (currentPTS / targetPTS) * 100) : 0;

  const handleSetTarget = () => {
    const parsedTarget = parseInt(newTarget);
    if (!isNaN(parsedTarget) && parsedTarget > 0) {
      setTargetPTS(parsedTarget);
      setShowSetTarget(false);
    } else {
      alert('Пожалуйста, введите корректное значение цели PTS');
    }
  };

  return (
    <section id="dashboard" className="dashboard">
      <div className="progress-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 className="progress-title">Прогресс до цели</h2>
          <button 
            className="btn btn-tertiary" 
            style={{ padding: '6px 12px', fontSize: '0.9rem' }}
            onClick={() => setShowSetTarget(!showSetTarget)}
          >
            {showSetTarget ? 'Отмена' : 'Изменить цель'}
          </button>
        </div>
        
        {showSetTarget ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="Цель PTS"
              className="pts-input"
              style={{ width: '150px' }}
            />
            <button 
              className="btn btn-primary"
              onClick={handleSetTarget}
            >
              Установить цель
            </button>
          </div>
        ) : null}
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progressPercent}%`,
                backgroundPosition: `${(100 - progressPercent) * 2}% 0%`
              }}
            >
              {Math.round(progressPercent)}%
            </div>
          </div>
          <div className="progress-text">
            {currentPTS} / {targetPTS} PTS
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Текущий PTS</h3>
          <p>{currentPTS}</p>
        </div>
        <div className="stat-card">
          <h3>Общий Winrate</h3>
          <p>{overallWinrate}%</p>
        </div>
        <div className="stat-card">
          <h3>Winrate сегодня</h3>
          <p>{todayWinrate}%</p>
        </div>
        <div className="stat-card">
          <h3>Winrate на этой неделе</h3>
          <p>{weeklyWinrate}%</p>
        </div>
        <div className="stat-card">
          <h3>Прогноз достижения цели</h3>
          <p>{forecastDays}</p>
        </div>
      </div>
      
      <AdaptiveForecast />
      <AchievementBadges />
    </section>
  );
};

export default Dashboard;