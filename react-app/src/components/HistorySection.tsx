import React, { useContext, useState } from 'react';
import { PTSDataContext } from '../context/PTSDataContext';
import './HistorySection.css';

const HistorySection: React.FC = () => {
  const context = useContext(PTSDataContext);
  if (!context) {
    throw new Error('HistorySection must be used within a PTSDataProvider');
  }

  const { gameDays, currentDay } = context;
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const toggleDay = (date: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const getTimeOfDayLabel = (timeOfDay: string) => {
    switch(timeOfDay) {
      case 'morning': return 'Утро';
      case 'afternoon': return 'День';
      case 'evening': return 'Вечер';
      case 'night': return 'Ночь';
      default: return timeOfDay;
    }
  };

  return (
    <section id="history" className="history-section">
      <h2 className="history-title">История игровых дней</h2>
      <div id="history-list" className="history-list">
        {/* Current day if it exists */}
        {currentDay && (
          <div className="day-entry">
            <div 
              className="day-header"
              onClick={() => toggleDay('current')}
            >
              <h3>Сегодня (текущий день)</h3>
              <div className="stats">
                {currentDay.matches && currentDay.matches.length > 0 ? (
                  <>
                    <span>Игр: {currentDay.matches.length}</span>
                    <span>Побед: {currentDay.matches.filter((m: any) => m.result === 'win').length}</span>
                    <span>Поражений: {currentDay.matches.filter((m: any) => m.result === 'loss').length}</span>
                    <span>PTS: 0</span>
                    <span>WR: {currentDay.matches.length > 0 ? 
                      Math.round((currentDay.matches.filter((m: any) => m.result === 'win').length / currentDay.matches.length) * 100) + '%' : 
                      '0%'}</span>
                  </>
                ) : currentDay.matchesCount !== undefined && currentDay.wins !== undefined ? (
                  <>
                    <span>Игр: {currentDay.matchesCount}</span>
                    <span>Побед: {currentDay.wins}</span>
                    <span>Поражений: {currentDay.matchesCount - currentDay.wins}</span>
                    <span>PTS: 0</span>
                    <span>WR: {currentDay.matchesCount > 0 ? 
                      Math.round((currentDay.wins / currentDay.matchesCount) * 100) + '%' : 
                      '0%'}</span>
                  </>
                ) : (
                  <>
                    <span>Игр: 0</span>
                    <span>Побед: 0</span>
                    <span>Поражений: 0</span>
                    <span>PTS: 0</span>
                    <span>WR: 0%</span>
                  </>
                )}
              </div>
            </div>
            <div className={`day-content ${expandedDays['current'] ? 'expanded' : ''}`}>
              {currentDay.matches && currentDay.matches.length > 0 ? (
                <div className="matches-list">
                  {currentDay.matches.map((match: any, index: number) => (
                    <div key={index} className={`match-item ${match.result}`}>
                      <div className="match-info">
                        <div className="match-hero">{match.hero}</div>
                        <div>{match.result === 'win' ? 'Победа' : 'Поражение'}</div>
                      </div>
                      <div className="match-details">
                        <span>{match.ptsChange >= 0 ? '+' : ''}{match.ptsChange} PTS</span>
                        <span>{match.duration} мин</span>
                        <span>{getTimeOfDayLabel(match.timeOfDay)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentDay.matchesCount !== undefined && currentDay.wins !== undefined ? (
                <div className="matches-list">
                  <p>Всего матчей: {currentDay.matchesCount}</p>
                  <p>Побед: {currentDay.wins}</p>
                  <p>Поражений: {currentDay.matchesCount - currentDay.wins}</p>
                  <p>Winrate: {currentDay.matchesCount > 0 ? 
                    Math.round((currentDay.wins / currentDay.matchesCount) * 100) + '%' : 
                    '0%'}</p>
                </div>
              ) : (
                <p>Нет данных о матчах за этот день</p>
              )}
            </div>
          </div>
        )}

        {/* Completed days in reverse chronological order */}
        {[...gameDays].reverse().map((day: any, index: number) => {
          const dateStr = new Date(day.date).toLocaleDateString('ru-RU');
          const dayKey = `${dateStr}-${index}`;
          
          return (
            <div key={dayKey} className="day-entry">
              <div 
                className="day-header"
                onClick={() => toggleDay(dayKey)}
              >
                <h3>{dateStr}</h3>
                <div className="stats">
                  <span>Игр: {day.matchesCount || 0}</span>
                  <span>Побед: {day.wins || 0}</span>
                  <span>Поражений: {day.losses || 0}</span>
                  <span>PTS: {day.ptsChange >= 0 ? '+' : ''}{day.ptsChange || 0}</span>
                  <span>WR: {day.winrate || 0}%</span>
                </div>
              </div>
              <div className={`day-content ${expandedDays[dayKey] ? 'expanded' : ''}`}>
                {day.matches && day.matches.length > 0 ? (
                  // Detailed matches view
                  <div className="matches-list">
                    {day.matches.map((match: any, matchIndex: number) => (
                      <div key={matchIndex} className={`match-item ${match.result}`}>
                        <div className="match-info">
                          <div className="match-hero">{match.hero}</div>
                          <div>{match.result === 'win' ? 'Победа' : 'Поражение'}</div>
                        </div>
                        <div className="match-details">
                          <span>{match.ptsChange >= 0 ? '+' : ''}{match.ptsChange} PTS</span>
                          <span>{match.duration} мин</span>
                          <span>{getTimeOfDayLabel(match.timeOfDay)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : day.matchesCount !== undefined && day.wins !== undefined ? (
                  // Simple matches view
                  <div className="matches-list">
                    <p>Всего матчей: {day.matchesCount}</p>
                    <p>Побед: {day.wins}</p>
                    <p>Поражений: {day.losses || day.matchesCount - day.wins}</p>
                    <p>Winrate: {day.winrate}%</p>
                  </div>
                ) : (
                  <p>Нет данных о матчах за этот день</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HistorySection;