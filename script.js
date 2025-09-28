// Dota 2 PTS Tracker - Enhanced script
class DotaPTStracker {
    constructor() {
        this.currentPTS = 0;
        this.targetPTS = 10000; // Default target
        this.gameDays = [];
        this.currentDay = null;
        this.charts = {};
        
        this.initializeElements();
        this.loadFromStorage();
        this.updateUI();
        this.attachEventListeners();
    }
    
    initializeElements() {
        // Buttons
        this.startDayBtn = document.getElementById('start-day-btn');
        this.endDayBtn = document.getElementById('end-day-btn');
        this.showAdvancedBtn = document.getElementById('show-advanced-btn');
        this.addMatchBtn = document.getElementById('add-match-btn');
        this.cancelMatchBtn = document.getElementById('cancel-match-btn');
        
        // Forms
        this.matchForm = document.getElementById('match-form');
        this.advancedForm = document.getElementById('advanced-form');
        
        // Dashboard elements
        this.currentPTSElement = document.getElementById('current-pts-value');
        this.overallWinrateElement = document.getElementById('overall-winrate');
        this.todayWinrateElement = document.getElementById('today-winrate');
        this.weeklyWinrateElement = document.getElementById('weekly-winrate');
        this.forecastDaysElement = document.getElementById('forecast-days');
        this.ptsProgressElement = document.getElementById('pts-progress');
        
        // History container
        this.historyListElement = document.getElementById('history-list');
    }
    
    attachEventListeners() {
        // Day control buttons
        this.startDayBtn.addEventListener('click', () => this.startGameDay());
        this.endDayBtn.addEventListener('click', () => this.endGameDay());
        
        // Advanced stats
        this.showAdvancedBtn.addEventListener('click', () => this.toggleAdvancedForm());
        this.addMatchBtn.addEventListener('click', () => this.showMatchForm());
        this.cancelMatchBtn.addEventListener('click', () => this.hideMatchForm());
        
        // Form submission
        this.matchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMatch();
        });
    }
    
    startGameDay() {
        if (this.currentDay) {
            alert('Игровой день уже начат!');
            return;
        }
        
        const startPTS = prompt('Введите начальный PTS:');
        if (startPTS !== null && !isNaN(startPTS)) {
            this.currentDay = {
                date: new Date(),
                startDate: new Date(),
                startTimePTS: parseInt(startPTS),
                matches: [],
                isComplete: false
            };
            
            this.startDayBtn.disabled = true;
            this.endDayBtn.disabled = false;
            
            alert('Игровой день начат!');
            this.updateUI();
        }
    }
    
    endGameDay() {
        if (!this.currentDay) {
            alert('Сначала начните игровой день!');
            return;
        }
        
        const endPTS = prompt('Введите конечный PTS:');
        if (endPTS !== null && !isNaN(endPTS)) {
            this.currentDay.endDate = new Date();
            this.currentDay.endTimePTS = parseInt(endPTS);
            this.currentDay.isComplete = true;
            
            // Calculate day stats
            this.calculateDayStats(this.currentDay);
            
            // Add to game days
            this.gameDays.push(this.currentDay);
            
            // Update current PTS
            this.currentPTS = this.currentDay.endTimePTS;
            
            // Reset current day
            this.currentDay = null;
            
            this.startDayBtn.disabled = false;
            this.endDayBtn.disabled = true;
            
            alert('Игровой день завершен!');
            this.saveToStorage();
            this.updateUI();
        }
    }
    
    addMatch() {
        if (!this.currentDay) {
            alert('Начните игровой день, чтобы добавить матчи!');
            return;
        }
        
        const formData = new FormData(this.matchForm);
        const match = {
            hero: formData.get('hero') || 'Не указан',
            result: formData.get('result'),
            ptsChange: parseInt(formData.get('pts-change')) || 0,
            timeOfDay: formData.get('time-of-day'),
            duration: parseInt(formData.get('duration')) || 0,
            date: new Date()
        };
        
        this.currentDay.matches.push(match);
        this.calculateDayStats(this.currentDay);
        
        // Reset form
        this.matchForm.reset();
        
        alert('Матч добавлен!');
        this.updateUI();
    }
    
    calculateDayStats(day) {
        if (!day.matches) day.matches = [];
        
        day.matchesCount = day.matches.length;
        day.wins = day.matches.filter(m => m.result === 'win').length;
        day.losses = day.matches.filter(m => m.result === 'loss').length;
        day.winrate = day.matchesCount > 0 ? Math.round((day.wins / day.matchesCount) * 100) : 0;
        
        // Calculate PTS change
        if (day.startTimePTS !== undefined && day.endTimePTS !== undefined) {
            day.ptsChange = day.endTimePTS - day.startTimePTS;
        } else {
            day.ptsChange = day.matches.reduce((sum, match) => sum + match.ptsChange, 0);
        }
    }
    
    toggleAdvancedForm() {
        const form = document.getElementById('advanced-form');
        if (form.style.display === 'none') {
            form.style.display = 'block';
            this.showAdvancedBtn.textContent = 'Скрыть расширенные настройки';
        } else {
            form.style.display = 'none';
            this.showAdvancedBtn.textContent = 'Показать расширенные настройки';
        }
    }
    
    showMatchForm() {
        document.getElementById('advanced-form').style.display = 'block';
    }
    
    hideMatchForm() {
        document.getElementById('advanced-form').style.display = 'none';
    }
    
    updateUI() {
        // Update dashboard stats
        this.updateDashboard();
        
        // Update history
        this.renderHistory();
        
        // Update charts
        this.updateCharts();
    }
    
    updateDashboard() {
        // Current PTS
        if (this.currentPTS) {
            this.currentPTSElement.textContent = this.currentPTS;
        }
        
        // Overall winrate
        const allMatches = this.getAllMatches();
        if (allMatches.length > 0) {
            const wins = allMatches.filter(m => m.result === 'win').length;
            const overallWinrate = Math.round((wins / allMatches.length) * 100);
            this.overallWinrateElement.textContent = `${overallWinrate}%`;
        } else {
            this.overallWinrateElement.textContent = '0%';
        }
        
        // Today's winrate
        const todayMatches = this.getTodaysMatches();
        if (todayMatches.length > 0) {
            const todayWins = todayMatches.filter(m => m.result === 'win').length;
            const todayWinrate = Math.round((todayWins / todayMatches.length) * 100);
            this.todayWinrateElement.textContent = `${todayWinrate}%`;
        } else {
            this.todayWinrateElement.textContent = '0%';
        }
        
        // This week's winrate
        const weeklyMatches = this.getWeeklyMatches();
        if (weeklyMatches.length > 0) {
            const weeklyWins = weeklyMatches.filter(m => m.result === 'win').length;
            const weeklyWinrate = Math.round((weeklyWins / weeklyMatches.length) * 100);
            this.weeklyWinrateElement.textContent = `${weeklyWinrate}%`;
        } else {
            this.weeklyWinrateElement.textContent = '0%';
        }
        
        // Forecast
        this.updateForecast();
        
        // Update target PTS display
        document.getElementById('target-pts').textContent = this.targetPTS;
        
        // Progress bar
        if (this.targetPTS > 0) {
            const progressPercent = Math.min(100, (this.currentPTS / this.targetPTS) * 100);
            this.ptsProgressElement.style.width = `${progressPercent}%`;
            this.ptsProgressElement.textContent = `${Math.round(progressPercent)}%`;
        }
    }
    
    updateForecast() {
        // Calculate based on current winrate
        const allMatches = this.getAllMatches();
        if (allMatches.length === 0) {
            this.forecastDaysElement.textContent = 'Нет данных';
            return;
        }
        
        const wins = allMatches.filter(m => m.result === 'win').length;
        const avgGamesPerDay = this.calculateAvgGamesPerDay();
        
        if (avgGamesPerDay === 0) {
            this.forecastDaysElement.textContent = 'Нет активности';
            return;
        }
        
        const currentWinrate = wins / allMatches.length;
        const ptsPerDayEstimate = this.calculatePtsPerDayEstimate(currentWinrate);
        
        if (ptsPerDayEstimate <= 0) {
            this.forecastDaysElement.textContent = 'Невозможно достичь цели';
            return;
        }
        
        const ptsNeeded = this.targetPTS - this.currentPTS;
        const daysNeeded = Math.ceil(ptsNeeded / ptsPerDayEstimate);
        
        this.forecastDaysElement.textContent = `${daysNeeded} дней`;
    }
    
    calculateAvgGamesPerDay() {
        if (this.gameDays.length === 0) return 0;
        
        const daysDiff = this.calculateDaysSinceStart();
        return daysDiff > 0 ? this.getTotalMatches() / daysDiff : 0;
    }
    
    calculateDaysSinceStart() {
        if (this.gameDays.length === 0) return 0;
        
        const firstDay = this.gameDays[0].date;
        const lastDay = this.gameDays[this.gameDays.length - 1].date;
        const diffTime = Math.abs(lastDay - firstDay);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    getTotalMatches() {
        return this.gameDays.reduce((total, day) => total + (day.matches ? day.matches.length : 0), 0);
    }
    
    calculatePtsPerDayEstimate(winrate) {
        // Simplified estimation - adjust based on your system
        // For example, assume average win = +20 PTS, average loss = -20 PTS
        const ptsPerWin = 20;
        const ptsPerLoss = -20;
        
        return (winrate * ptsPerWin) + ((1 - winrate) * ptsPerLoss);
    }
    
    getAllMatches() {
        let allMatches = [];
        
        // Add matches from completed days
        this.gameDays.forEach(day => {
            if (day.matches) {
                allMatches = allMatches.concat(day.matches);
            }
        });
        
        // Add matches from current day if it exists
        if (this.currentDay && this.currentDay.matches) {
            allMatches = allMatches.concat(this.currentDay.matches);
        }
        
        return allMatches;
    }
    
    getTodaysMatches() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.getAllMatches().filter(match => {
            const matchDate = new Date(match.date);
            matchDate.setHours(0, 0, 0, 0);
            return matchDate.getTime() === today.getTime();
        });
    }
    
    getWeeklyMatches() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return this.getAllMatches().filter(match => {
            return new Date(match.date) >= oneWeekAgo;
        });
    }
    
    renderHistory() {
        // Clear current history
        this.historyListElement.innerHTML = '';
        
        // Add current day if it exists
        if (this.currentDay) {
            this.renderDayEntry(this.currentDay, true);
        }
        
        // Add completed days in reverse chronological order
        [...this.gameDays].reverse().forEach(day => {
            this.renderDayEntry(day, false);
        });
    }
    
    renderDayEntry(day, isCurrent) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day-entry';
        
        // Calculate day stats if not already calculated
        if (!day.matchesCount) {
            this.calculateDayStats(day);
        }
        
        // Create header
        const headerElement = document.createElement('div');
        headerElement.className = 'day-header';
        headerElement.innerHTML = `
            <h3>${day.date.toLocaleDateString('ru-RU')} ${isCurrent ? '(сегодня)' : ''}</h3>
            <div class="stats">
                <span>Игр: ${day.matchesCount || 0}</span>
                <span>Побед: ${day.wins || 0}</span>
                <span>Поражений: ${day.losses || 0}</span>
                <span>PTS: ${day.ptsChange >= 0 ? '+' : ''}${day.ptsChange || 0}</span>
                <span>WR: ${day.winrate || 0}%</span>
            </div>
        `;
        
        // Add click event to toggle details
        headerElement.addEventListener('click', () => {
            const content = dayElement.querySelector('.day-content');
            content.classList.toggle('expanded');
        });
        
        // Create content
        const contentElement = document.createElement('div');
        contentElement.className = 'day-content';
        
        // Add matches list if any
        if (day.matches && day.matches.length > 0) {
            const matchesList = document.createElement('div');
            matchesList.className = 'matches-list';
            
            day.matches.forEach(match => {
                const matchElement = document.createElement('div');
                matchElement.className = `match-item ${match.result}`;
                matchElement.innerHTML = `
                    <div>
                        <strong>${match.hero}</strong> - 
                        ${match.result === 'win' ? 'Победа' : 'Поражение'}
                    </div>
                    <div>
                        ${match.ptsChange >= 0 ? '+' : ''}${match.ptsChange} PTS | 
                        ${match.duration} мин | 
                        ${this.getTimeOfDayLabel(match.timeOfDay)}
                    </div>
                `;
                matchesList.appendChild(matchElement);
            });
            
            contentElement.appendChild(matchesList);
        } else {
            contentElement.innerHTML = '<p>Нет данных о матчах за этот день</p>';
        }
        
        dayElement.appendChild(headerElement);
        dayElement.appendChild(contentElement);
        
        this.historyListElement.appendChild(dayElement);
    }
    
    getTimeOfDayLabel(timeOfDay) {
        switch(timeOfDay) {
            case 'morning': return 'Утро';
            case 'afternoon': return 'День';
            case 'evening': return 'Вечер';
            case 'night': return 'Ночь';
            default: return timeOfDay;
        }
    }
    
    updateCharts() {
        this.renderPtsHistoryChart();
        this.renderWinratePeriodsChart();
        this.renderHeroPieChart();
        this.renderTimeOfDayChart();
    }
    
    renderPtsHistoryChart() {
        const ctx = document.getElementById('pts-history-chart').getContext('2d');
        
        // Prepare data
        const dates = [];
        const ptsValues = [];
        
        // Add starting point if we have target
        if (this.targetPTS > 0 && this.gameDays.length > 0) {
            // We would need initial PTS value
        }
        
        // Add data points for each completed day
        this.gameDays.forEach(day => {
            if (day.endTimePTS !== undefined) {
                dates.push(day.date.toLocaleDateString('ru-RU'));
                ptsValues.push(day.endTimePTS);
            }
        });
        
        // If we have data, create or update chart
        if (dates.length > 0) {
            if (this.charts.ptsHistory) {
                this.charts.ptsHistory.destroy();
            }
            
            this.charts.ptsHistory = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'PTS',
                        data: ptsValues,
                        borderColor: 'rgb(59, 130, 246)', // blue-500
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'История PTS по дням'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
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
                }
            });
        } else {
            // Create an empty chart with target line if no data
            if (this.charts.ptsHistory) {
                this.charts.ptsHistory.destroy();
            }
            
            this.charts.ptsHistory = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Начало', 'Цель'],
                    datasets: [{
                        label: 'PTS',
                        data: [0, this.targetPTS],
                        borderColor: 'rgba(156, 163, 175, 0.3)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'История PTS по дням'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
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
                }
            });
        }
    }
    
    renderWinratePeriodsChart() {
        const ctx = document.getElementById('winrate-periods-chart').getContext('2d');
        
        // Calculate winrates for different periods
        const todayMatches = this.getTodaysMatches();
        const weeklyMatches = this.getWeeklyMatches();
        // For monthly, we'll use last 30 days
        const monthlyMatches = this.getMonthlyMatches();
        
        const todayWinrate = todayMatches.length > 0 ? 
            Math.round((todayMatches.filter(m => m.result === 'win').length / todayMatches.length) * 100) : 0;
        const weeklyWinrate = weeklyMatches.length > 0 ? 
            Math.round((weeklyMatches.filter(m => m.result === 'win').length / weeklyMatches.length) * 100) : 0;
        const monthlyWinrate = monthlyMatches.length > 0 ? 
            Math.round((monthlyMatches.filter(m => m.result === 'win').length / monthlyMatches.length) * 100) : 0;
        
        if (this.charts.winratePeriods) {
            this.charts.winratePeriods.destroy();
        }
        
        this.charts.winratePeriods = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Сегодня', 'Неделя', 'Месяц'],
                datasets: [{
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
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Winrate по периодам'
                    }
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
            }
        });
    }
    
    renderHeroPieChart() {
        const ctx = document.getElementById('hero-pie-chart').getContext('2d');
        
        // Calculate hero statistics
        const allMatches = this.getAllMatches();
        const heroStats = {};
        
        allMatches.forEach(match => {
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
        
        if (heroEntries.length > 0) {
            if (this.charts.heroPie) {
                this.charts.heroPie.destroy();
            }
            
            const labels = heroEntries.map(entry => entry[0]);
            const data = heroEntries.map(entry => entry[1].total);
            const backgroundColors = [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
            ];
            
            this.charts.heroPie = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Количество игр',
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 205, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Топ 5 героев по количеству игр'
                        }
                    }
                }
            });
        }
    }
    
    renderTimeOfDayChart() {
        const ctx = document.getElementById('time-of-day-chart').getContext('2d');
        
        // Calculate winrate by time of day
        const allMatches = this.getAllMatches();
        const timeOfDayStats = {
            morning: { wins: 0, losses: 0, total: 0 },
            afternoon: { wins: 0, losses: 0, total: 0 },
            evening: { wins: 0, losses: 0, total: 0 },
            night: { wins: 0, losses: 0, total: 0 }
        };
        
        allMatches.forEach(match => {
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
        
        if (this.charts.timeOfDay) {
            this.charts.timeOfDay.destroy();
        }
        
        this.charts.timeOfDay = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Winrate (%)',
                        data: winRates,
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Количество игр',
                        data: gameCounts,
                        type: 'line',
                        fill: false,
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderWidth: 3,
                        pointBackgroundColor: 'rgb(245, 158, 11)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Статистика по времени суток'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Winrate (%)'
                        },
                        min: 0,
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Количество игр'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Время суток'
                        }
                    }
                }
            }
        });
    }
    
    getMonthlyMatches() {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        
        return this.getAllMatches().filter(match => {
            return new Date(match.date) >= oneMonthAgo;
        });
    }
    
    saveToStorage() {
        const data = {
            currentPTS: this.currentPTS,
            targetPTS: this.targetPTS,
            gameDays: this.gameDays,
            currentDay: this.currentDay
        };
        
        localStorage.setItem('dotaPTStrackerData', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const data = localStorage.getItem('dotaPTStrackerData');
        if (data) {
            const parsed = JSON.parse(data);
            this.currentPTS = parsed.currentPTS || 0;
            this.targetPTS = parsed.targetPTS || 0;
            this.gameDays = parsed.gameDays || [];
            this.currentDay = parsed.currentDay || null;
            
            // Restore date objects
            this.gameDays.forEach(day => {
                day.date = new Date(day.date);
                if (day.startDate) day.startDate = new Date(day.startDate);
                if (day.endDate) day.endDate = new Date(day.endDate);
                
                if (day.matches) {
                    day.matches.forEach(match => {
                        match.date = new Date(match.date);
                    });
                }
            });
            
            if (this.currentDay) {
                this.currentDay.date = new Date(this.currentDay.date);
                this.currentDay.startDate = new Date(this.currentDay.startDate);
                
                if (this.currentDay.matches) {
                    this.currentDay.matches.forEach(match => {
                        match.date = new Date(match.date);
                    });
                }
            }
        } else {
            // Set a default target if no data exists
            this.targetPTS = 10000; // Example target
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dotaPTStracker = new DotaPTStracker();
});