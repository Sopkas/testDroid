import React, { useContext } from 'react';
import { PTSDataContext } from '../context/PTSDataContext';
import './AchievementBadges.css';

interface Achievement {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  threshold: number;
  icon: string;
  color: string;
}

const AchievementBadges: React.FC = () => {
  const context = useContext(PTSDataContext);
  if (!context) {
    throw new Error('AchievementBadges must be used within a PTSDataProvider');
  }

  const { currentPTS } = context;

  // Определяем достижения
  const achievements: Achievement[] = [
    {
      id: 'pts-1000',
      title: 'Новичок',
      description: 'Преодолел 1000 ПТС',
      achieved: currentPTS >= 1000,
      threshold: 1000,
      icon: '⭐',
      color: '#94a3b8' // gray-400
    },
    {
      id: 'pts-1500',
      title: 'Боец',
      description: 'Преодолел 1500 ПТС',
      achieved: currentPTS >= 1500,
      threshold: 1500,
      icon: '🎯',
      color: '#60a5fa' // blue-400
    },
    {
      id: 'pts-2000',
      title: 'Профессионал',
      description: 'Преодолел 2000 ПТС',
      achieved: currentPTS >= 2000,
      threshold: 2000,
      icon: '🏅',
      color: '#fbbf24' // amber-400
    },
    {
      id: 'pts-3000',
      title: 'Легенда',
      description: 'Преодолел 3000 ПТС',
      achieved: currentPTS >= 3000,
      threshold: 3000,
      icon: '👑',
      color: '#f472b6' // pink-400
    },
    {
      id: 'pts-4000',
      title: 'Бог ПТС',
      description: 'Преодолел 4000 ПТС',
      achieved: currentPTS >= 4000,
      threshold: 4000,
      icon: '🌟',
      color: '#8b5cf6' // violet-400
    },
    {
      id: 'pts-5000',
      title: 'Несокрушимый',
      description: 'Преодолел 5000 ПТС',
      achieved: currentPTS >= 5000,
      threshold: 5000,
      icon: '🔥',
      color: '#ef4444' // red-500
    }
  ];

  // Фильтруем только достигнутые достижения
  const unlockedAchievements = achievements.filter(ach => ach.achieved);

  return (
    <div className="achievements-container">
      <h3>Достижения</h3>
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`achievement-badge ${achievement.achieved ? 'achieved' : 'locked'}`}
            title={achievement.description}
          >
            <div 
              className="achievement-icon"
              style={{ 
                backgroundColor: achievement.achieved ? achievement.color : '#cbd5e1',
                color: achievement.achieved ? 'white' : '#64748b'
              }}
            >
              <span className="icon">{achievement.icon}</span>
            </div>
            <div className="achievement-info">
              <h4 className={achievement.achieved ? 'achieved-title' : 'locked-title'}>
                {achievement.title}
              </h4>
              <p className="achievement-threshold">≥ {achievement.threshold}</p>
            </div>
          </div>
        ))}
      </div>
      
      {unlockedAchievements.length > 0 && (
        <div className="unlocked-summary">
          <p>Разблокировано: <strong>{unlockedAchievements.length}</strong> из {achievements.length}</p>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;