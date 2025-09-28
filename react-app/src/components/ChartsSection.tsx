import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Pie, Chart } from 'react-chartjs-2';
import { PTSDataContext } from '../context/PTSDataContext';
import './ChartsSection.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsSection: React.FC = () => {
  const [chartInstance, setChartInstance] = useState<any>(null);
  const context = useContext(PTSDataContext);
  if (!context) {
    throw new Error('ChartsSection must be used within a PTSDataProvider');
  }

  const { gameDays, currentDay, currentPTS, targetPTS } = context;
  
  // Prepare data for the PTS history chart
  const ptsHistoryData = {
    labels: gameDays.map(day => new Date(day.date).toLocaleDateString('ru-RU')),
    datasets: [
      {
        label: 'PTS',
        data: gameDays.map(day => day.endTimePTS),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3
      }
    ]
  };

  const ptsHistoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'История PTS по дням',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'PTS'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Дата'
        }
      }
    }
  };

  // Prepare data for winrate periods chart
  // Calculate winrates for different periods
  const getAllMatches = () => {
    let allMatches: any[] = [];
    
    // Add matches from completed days
    gameDays.forEach((day: any) => {
      if (day.matches && day.matches.length > 0) {
        // Detailed input: use individual matches
        allMatches = allMatches.concat(day.matches);
      } else if (day.matchesCount !== undefined && day.wins !== undefined) {
        // Simple input: create virtual matches
        const wins = day.wins;
        const losses = day.matchesCount - day.wins;
        
        // Add win matches
        for (let i = 0; i < wins; i++) {
          allMatches.push({
            result: 'win',
            date: day.date
          });
        }
        
        // Add loss matches
        for (let i = 0; i < losses; i++) {
          allMatches.push({
            result: 'loss',
            date: day.date
          });
        }
      }
    });
    
    // Add matches from current day if it exists
    if (currentDay) {
      if (currentDay.matches && currentDay.matches.length > 0) {
        // Detailed input: use individual matches
        allMatches = allMatches.concat(currentDay.matches);
      } else if (currentDay.matchesCount !== undefined && currentDay.wins !== undefined) {
        // Simple input: create virtual matches
        const wins = currentDay.wins;
        const losses = currentDay.matchesCount - currentDay.wins;
        
        // Add win matches
        for (let i = 0; i < wins; i++) {
          allMatches.push({
            result: 'win',
            date: currentDay.date
          });
        }
        
        // Add loss matches
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

  const getTodaysMatches = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return getAllMatches().filter((match: any) => {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() === today.getTime();
    });
  };

  const getWeeklyMatches = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return getAllMatches().filter((match: any) => {
      return new Date(match.date) >= oneWeekAgo;
    });
  };

  const getMonthlyMatches = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    return getAllMatches().filter((match: any) => {
      return new Date(match.date) >= oneMonthAgo;
    });
  };

  const todayMatches = getTodaysMatches();
  const weeklyMatches = getWeeklyMatches();
  const monthlyMatches = getMonthlyMatches();

  const todayWinrate = todayMatches.length > 0 ? 
    Math.round((todayMatches.filter((m: any) => m.result === 'win').length / todayMatches.length) * 100) : 0;
  const weeklyWinrate = weeklyMatches.length > 0 ? 
    Math.round((weeklyMatches.filter((m: any) => m.result === 'win').length / weeklyMatches.length) * 100) : 0;
  const monthlyWinrate = monthlyMatches.length > 0 ? 
    Math.round((monthlyMatches.filter((m: any) => m.result === 'win').length / monthlyMatches.length) * 100) : 0;

  const winratePeriodsData = {
    labels: ['Сегодня', 'Неделя', 'Месяц'],
    datasets: [
      {
        label: 'Winrate (%)',
        data: [todayWinrate, weeklyWinrate, monthlyWinrate],
        backgroundColor: [
          'rgba(59, 130, 246, 0.2)', // blue-400
          'rgba(16, 185, 129, 0.2)', // green-400
          'rgba(245, 158, 11, 0.2)'  // amber-400
        ],
        borderColor: [
          'rgb(59, 130, 246)', // blue-500
          'rgb(16, 185, 129)', // green-500
          'rgb(245, 158, 11)'  // amber-500
        ],
        borderWidth: 1,
      },
    ],
  };

  const winratePeriodsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Winrate по периодам',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Процент'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Период'
        }
      }
    }
  };

  // Prepare data for the hero pie chart
  const allMatches = getAllMatches();
  const heroStats: Record<string, { wins: number; losses: number; total: number }> = {};
  
  allMatches.forEach((match: any) => {
    const hero = match.hero || 'Не указан';
    if (!heroStats[hero]) {
      heroStats[hero] = { wins: 0, losses: 0, total: 0 };
    }
    
    heroStats[hero].total++;
    if (match.result === 'win') {
      heroStats[hero].wins++;
    } else {
      heroStats[hero].losses++;
    }
  });
  
  // Prepare data for top 5 heroes
  const heroEntries = Object.entries(heroStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);
  
  const heroPieData = {
    labels: heroEntries.map(entry => entry[0]),
    datasets: [
      {
        label: 'Количество игр',
        data: heroEntries.map(entry => entry[1].total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };
  
  const heroPieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Топ 5 героев по количеству игр',
      }
    }
  };

  // Prepare data for time of day chart
  const timeOfDayStats: Record<string, { wins: number; losses: number; total: number }> = {
    morning: { wins: 0, losses: 0, total: 0 },
    afternoon: { wins: 0, losses: 0, total: 0 },
    evening: { wins: 0, losses: 0, total: 0 },
    night: { wins: 0, losses: 0, total: 0 }
  };
  
  allMatches.forEach((match: any) => {
    const timeOfDay = match.timeOfDay || 'morning';
    timeOfDayStats[timeOfDay].total++;
    if (match.result === 'win') {
      timeOfDayStats[timeOfDay].wins++;
    } else {
      timeOfDayStats[timeOfDay].losses++;
    }
  });
  
  const labels = ['Утро (6-12)', 'День (12-18)', 'Вечер (18-24)', 'Ночь (0-6)'];
  const timeKeys = ['morning', 'afternoon', 'evening', 'night'];
  const winRates = timeKeys.map(key => {
    const stats = timeOfDayStats[key];
    return stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
  });
  const gameCounts = timeKeys.map(key => timeOfDayStats[key].total);
  
  // Winrate by time of day
  const timeOfDayWinrateData = {
    labels: labels,
    datasets: [
      {
        label: 'Winrate (%)',
        data: winRates,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ]
  };
  
  const timeOfDayWinrateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Winrate по времени суток',
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Winrate (%)',
        },
        min: 0,
        max: 100,
      },
      x: {
        title: {
          display: true,
          text: 'Время суток'
        }
      }
    }
  };
  
  // Game count by time of day
  const timeOfDayCountData = {
    labels: labels,
    datasets: [
      {
        label: 'Количество игр',
        data: gameCounts,
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      }
    ]
  };
  
  const timeOfDayCountOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Количество игр по времени суток',
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Количество игр',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Время суток'
        }
      }
    }
  };

  return (
    <section id="charts" className="charts-section">
      <h2 className="charts-title">Аналитика и графики</h2>
      
      <div className="chart-container">
        <Line options={ptsHistoryOptions} data={ptsHistoryData} />
      </div>
      
      <div className="chart-container">
        <Bar options={winratePeriodsOptions} data={winratePeriodsData} />
      </div>
      
      <div className="chart-container">
        <Pie options={heroPieOptions} data={heroPieData} />
      </div>
      
      <div className="chart-container">
        <Bar options={timeOfDayWinrateOptions} data={timeOfDayWinrateData} />
      </div>
      
      <div className="chart-container">
        <Bar options={timeOfDayCountOptions} data={timeOfDayCountData} />
      </div>
    </section>
  );
};

export default ChartsSection;