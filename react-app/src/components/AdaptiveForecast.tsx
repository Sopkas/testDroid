import React, { useContext } from 'react';
import { PTSDataContext } from '../context/PTSDataContext';
import './AdaptiveForecast.css';

interface Match {
  result: string;
  ptsChange?: number;
  date: Date | string;
}

interface GameDay {
  date: Date | string;
  startTimePTS: number;
  endTimePTS: number;
  matches: Match[];
  matchesCount?: number;
  wins?: number;
  losses?: number;
}

const AdaptiveForecast: React.FC = () => {
  const context = useContext(PTSDataContext);
  if (!context) {
    throw new Error('AdaptiveForecast must be used within a PTSDataProvider');
  }

  const { currentPTS, targetPTS, gameDays, currentDay } = context;

  // Получаем все матчи из всех игровых дней
  const getAllMatches = (): Match[] => {
    let allMatches: Match[] = [];

    // Добавляем матчи из завершенных дней
    gameDays.forEach((day: GameDay) => {
      if (day.matches && day.matches.length > 0) {
        // Подробный ввод: используем отдельные матчи
        allMatches = allMatches.concat(day.matches);
      } else if (day.matchesCount !== undefined && day.wins !== undefined) {
        // Простой ввод: создаем виртуальные матчи
        const wins = day.wins;
        const losses = day.matchesCount - day.wins;

        // Добавляем победные матчи
        for (let i = 0; i < wins; i++) {
          allMatches.push({
            result: 'win',
            date: day.date
          });
        }

        // Добавляем проигранные матчи
        for (let i = 0; i < losses; i++) {
          allMatches.push({
            result: 'loss',
            date: day.date
          });
        }
      }
    });

    // Добавляем матчи из текущего дня, если существует
    if (currentDay) {
      if (currentDay.matches && currentDay.matches.length > 0) {
        // Подробный ввод: используем отдельные матчи
        allMatches = allMatches.concat(currentDay.matches);
      } else if (currentDay.matchesCount !== undefined && currentDay.wins !== undefined) {
        // Простой ввод: создаем виртуальные матчи
        const wins = currentDay.wins;
        const losses = currentDay.matchesCount - currentDay.wins;

        // Добавляем победные матчи
        for (let i = 0; i < wins; i++) {
          allMatches.push({
            result: 'win',
            date: currentDay.date
          });
        }

        // Добавляем проигранные матчи
        for (let i = 0; i < losses; i++) {
          allMatches.push({
            result: 'loss',
            date: currentDay.date
          });
        }
      }
    }

    return allMatches;
  };

  // Рассчитываем адаптивный прогноз
  const calculateAdaptiveForecast = (): { days: string, explanation: string } => {
    const allMatches = getAllMatches();
    const totalMatches = allMatches.length;

    if (totalMatches === 0) {
      return { 
        days: 'Нет данных', 
        explanation: 'Нет сыгранных матчей для расчета прогноза' 
      };
    }

    // Рассчитываем фактический винрейт
    const wins = allMatches.filter(m => m.result === 'win').length;
    const actualWR = wins / totalMatches;

    // Проверяем, достаточно ли данных для надежного прогноза
    if (totalMatches < 5) {
      // Если мало данных, используем предполагаемый винрейт
      return { 
        days: 'Мало данных', 
        explanation: `Сыграно всего ${totalMatches} матчей, рекомендуется сыграть больше игр для точного прогноза` 
      };
    }

    // Предполагаемые значения прироста/потери PTS
    const ptsGainPerWin = 20;
    const ptsLossPerLoss = 20;

    // Рассчитываем средний прирост за матч с учетом текущего винрейта
    const ptsAvgPerMatch = (actualWR * ptsGainPerWin) - ((1 - actualWR) * ptsLossPerLoss);

    if (ptsAvgPerMatch <= 0) {
      return { 
        days: 'Невозможно достичь цели', 
        explanation: 'При текущем винрейте ПТС не будет расти, необходимо улучшить показатели' 
      };
    }

    // Рассчитываем количество матчей, необходимых до цели
    const ptsNeeded = targetPTS - currentPTS;
    const matchesNeeded = ptsNeeded / ptsAvgPerMatch;

    // Рассчитываем среднее количество матчей в день
    if (gameDays.length === 0) {
      return { 
        days: 'Нет данных', 
        explanation: 'Нет завершенных игровых дней для расчета среднего количества матчей в день' 
      };
    }

    // Подсчитываем общее количество матчей и дней
    let totalDaysWithMatches = 0;
    let totalMatchesCount = 0;

    gameDays.forEach((day: GameDay) => {
      if (day.matches && day.matches.length > 0) {
        totalMatchesCount += day.matches.length;
        totalDaysWithMatches++;
      } else if (day.matchesCount !== undefined) {
        totalMatchesCount += day.matchesCount;
        totalDaysWithMatches++;
      }
    });

    const avgMatchesPerDay = totalDaysWithMatches > 0 ? totalMatchesCount / totalDaysWithMatches : 1;

    if (avgMatchesPerDay <= 0) {
      return { 
        days: 'Нет данных', 
        explanation: 'Нет информации о количестве матчей в день' 
      };
    }

    // Рассчитываем количество дней до цели
    const daysNeeded = matchesNeeded / avgMatchesPerDay;

    // Формируем объяснение
    const explanation = `
      Текущий винрейт: ${(actualWR * 100).toFixed(1)}% (основан на ${totalMatches} матчах)
      Средний прирост за матч: ${ptsAvgPerMatch.toFixed(1)} ПТС
      Среднее количество матчей в день: ${avgMatchesPerDay.toFixed(1)}
      При таких темпах цель будет достигнута за ${Math.ceil(daysNeeded)} дней
    `;

    return { 
      days: `${Math.ceil(daysNeeded)} дней`, 
      explanation: explanation.trim() 
    };
  };

  const forecast = calculateAdaptiveForecast();

  return (
    <div className="adaptive-forecast">
      <h3>Адаптивный прогноз достижения цели</h3>
      <div className="forecast-display">
        <p className="forecast-text">{forecast.days}</p>
        <div className="forecast-explanation">
          <p>{forecast.explanation}</p>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveForecast;