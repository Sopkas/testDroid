import React, { useContext, useState } from 'react';
import { PTSDataContext } from '../context/PTSDataContext';
import './AdvancedStats.css';

const AdvancedStats: React.FC = () => {
  const context = useContext(PTSDataContext);
  if (!context) {
    throw new Error('AdvancedStats must be used within a PTSDataProvider');
  }

  const { currentDay, setCurrentDay } = context;
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hero: '',
    result: 'win',
    ptsChange: '',
    timeOfDay: 'morning',
    duration: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ptsChange' || name === 'duration' ? value : value
    }));
  };

  const addMatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentDay) {
      alert('Начните игровой день, чтобы добавить матчи!');
      return;
    }
    
    // If the day was started with simple input, convert it to detailed input
    if (currentDay.matchesCount !== undefined || currentDay.wins !== undefined) {
      alert('Вы уже ввели общую статистику для этого дня. Для добавления отдельных матчей переключитесь в режим подробного ввода.');
      return;
    }
    
    const newMatch = {
      hero: formData.hero || 'Не указан',
      result: formData.result,
      ptsChange: parseInt(formData.ptsChange) || 0,
      timeOfDay: formData.timeOfDay,
      duration: parseInt(formData.duration) || 0,
      date: new Date()
    };
    
    setCurrentDay((prev: any) => ({
      ...prev,
      matches: [...(prev.matches || []), newMatch]
    }));
    
    // Reset form
    setFormData({
      hero: '',
      result: 'win',
      ptsChange: '',
      timeOfDay: 'morning',
      duration: ''
    });
    
    alert('Матч добавлен!');
  };

  if (!currentDay) {
    return null; // Don't show advanced stats if no current day
  }

  // Don't show advanced stats if the day was started with simple input
  if (currentDay.matchesCount !== undefined || currentDay.wins !== undefined) {
    return null;
  }

  return (
    <section id="advanced-stats" className="advanced-stats-section">
      <h2 className="advanced-title">Расширенная статистика</h2>
      <div className="advanced-controls">
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-tertiary"
        >
          {showForm ? 'Скрыть форму' : 'Показать форму'}
        </button>
      </div>
      
      {showForm && (
        <div className="form-container">
          <h3 className="form-title">Добавить матч</h3>
          <form onSubmit={addMatch}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hero">Герой:</label>
                <input
                  type="text"
                  id="hero"
                  name="hero"
                  value={formData.hero}
                  onChange={handleInputChange}
                  placeholder="Например: Pudge"
                />
              </div>
              <div className="form-group">
                <label htmlFor="result">Результат:</label>
                <select
                  id="result"
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                >
                  <option value="win">Победа</option>
                  <option value="loss">Поражение</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ptsChange">Изменение PTS:</label>
                <input
                  type="number"
                  id="ptsChange"
                  name="ptsChange"
                  value={formData.ptsChange}
                  onChange={handleInputChange}
                  placeholder="Например: 20"
                />
              </div>
              <div className="form-group">
                <label htmlFor="timeOfDay">Время суток:</label>
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  value={formData.timeOfDay}
                  onChange={handleInputChange}
                >
                  <option value="morning">Утро (6-12)</option>
                  <option value="afternoon">День (12-18)</option>
                  <option value="evening">Вечер (18-24)</option>
                  <option value="night">Ночь (0-6)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Длительность (мин):</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Например: 45"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <button type="submit" className="btn btn-primary">Сохранить матч</button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="btn btn-secondary"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default AdvancedStats;