/**
 * Calendar View Utility for Appointment Scheduling
 * Provides interactive calendar display with appointment visualization
 */

class CalendarView {
    constructor() {
        this.currentDate = new Date();
        this.appointments = [];
        this.selectedDate = null;
        this.viewMode = 'month'; // 'month', 'week', 'day'
    }

    /**
     * Initialize calendar with appointments
     */
    setAppointments(appointments) {
        this.appointments = appointments || [];
    }

    /**
     * Get appointments for a specific date
     */
    getAppointmentsForDate(date) {
        const dateStr = this.formatDate(date);
        return this.appointments.filter(apt => {
            const aptDate = this.formatDate(new Date(apt.startTime));
            return aptDate === dateStr;
        });
    }

    /**
     * Format date to YYYY-MM-DD
     */
    formatDate(date) {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    }

    /**
     * Get month calendar data
     */
    getMonthData(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const weeks = [];
        let week = new Array(7).fill(null);
        let dayCounter = 1;

        // Fill first week
        for (let i = startingDayOfWeek; i < 7 && dayCounter <= daysInMonth; i++) {
            week[i] = dayCounter++;
        }
        weeks.push([...week]);

        // Fill remaining weeks
        while (dayCounter <= daysInMonth) {
            week = new Array(7).fill(null);
            for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
                week[i] = dayCounter++;
            }
            weeks.push([...week]);
        }

        return weeks;
    }

    /**
     * Generate HTML for month view
     */
    generateMonthView(year, month) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const weeks = this.getMonthData(year, month);
        let html = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" data-action="prev-month">◀</button>
                    <h2>${monthNames[month]} ${year}</h2>
                    <button class="calendar-nav-btn" data-action="next-month">▶</button>
                </div>
                
                <div class="calendar-weekdays">
        `;

        // Day headers
        dayNames.forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });

        html += `</div><div class="calendar-days">`;

        // Calendar days
        weeks.forEach(week => {
            week.forEach(day => {
                if (day === null) {
                    html += `<div class="calendar-day empty"></div>`;
                } else {
                    const date = new Date(year, month, day);
                    const dateStr = this.formatDate(date);
                    const appointments = this.getAppointmentsForDate(date);
                    const isToday = this.isToday(date);
                    const isSelected = this.selectedDate && this.formatDate(this.selectedDate) === dateStr;

                    html += `
                        <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                             data-date="${dateStr}">
                            <div class="calendar-day-number">${day}</div>
                            <div class="calendar-day-appointments">
                    `;

                    appointments.slice(0, 2).forEach(apt => {
                        const statusClass = apt.status.toLowerCase();
                        html += `<div class="calendar-appointment ${statusClass}" title="${apt.title}">
                                    ${this.formatTime(apt.startTime)}
                                </div>`;
                    });

                    if (appointments.length > 2) {
                        html += `<div class="calendar-more">+${appointments.length - 2} more</div>`;
                    }

                    html += `
                            </div>
                        </div>
                    `;
                }
            });
        });

        html += `</div></div>`;
        return html;
    }

    /**
     * Generate HTML for week view
     */
    generateWeekView(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());

        let html = `
            <div class="calendar-week-container">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" data-action="prev-week">◀</button>
                    <h2>Week of ${this.formatDate(startOfWeek)}</h2>
                    <button class="calendar-nav-btn" data-action="next-week">▶</button>
                </div>
                
                <div class="calendar-week-grid">
        `;

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            const appointments = this.getAppointmentsForDate(currentDate);
            const isToday = this.isToday(currentDate);

            html += `
                <div class="calendar-week-day ${isToday ? 'today' : ''}">
                    <div class="calendar-week-day-header">
                        <div class="calendar-week-day-name">${dayNames[i]}</div>
                        <div class="calendar-week-day-date">${currentDate.getDate()}</div>
                    </div>
                    <div class="calendar-week-day-appointments">
            `;

            appointments.forEach(apt => {
                const statusClass = apt.status.toLowerCase();
                html += `
                    <div class="calendar-week-appointment ${statusClass}"
                         data-apt='${JSON.stringify(apt).replace(/"/g, '&quot;')}'
                         title="${apt.title}">
                        <div class="calendar-week-appointment-time">${this.formatTime(apt.startTime)}</div>
                        <div class="calendar-week-appointment-title">${apt.title}</div>
                        <div class="calendar-week-appointment-duration">${apt.duration}min</div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        html += `</div></div>`;
        return html;
    }

    /**
     * Generate HTML for day view
     */
    generateDayView(date) {
        const appointments = this.getAppointmentsForDate(date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];

        let html = `
            <div class="calendar-day-container">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" data-action="prev-day">◀</button>
                    <h2>${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</h2>
                    <button class="calendar-nav-btn" data-action="next-day">▶</button>
                </div>
                
                <div class="calendar-day-timeline">
        `;

        // Generate hourly timeline
        for (let hour = 9; hour < 18; hour++) {
            const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
            html += `<div class="calendar-timeline-hour">${timeStr}</div>`;
        }

        html += `</div><div class="calendar-day-appointments-list">`;

        if (appointments.length === 0) {
            html += `<div class="calendar-no-appointments">No appointments scheduled for this day</div>`;
        } else {
            appointments.forEach(apt => {
                const statusClass = apt.status.toLowerCase();
                html += `
                    <div class="calendar-day-appointment ${statusClass}"
                         data-apt='${JSON.stringify(apt).replace(/"/g, '&quot;')}'>
                        <div class="calendar-day-appointment-time">
                            ${this.formatTime(apt.startTime)} - ${this.formatTime(apt.endTime)}
                        </div>
                        <div class="calendar-day-appointment-title">${apt.title}</div>
                        <div class="calendar-day-appointment-type">${apt.type}</div>
                        <div class="calendar-day-appointment-duration">${apt.duration} minutes</div>
                        <div class="calendar-day-appointment-status">${apt.status}</div>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
        return html;
    }

    /**
     * Format time to HH:MM
     */
    formatTime(dateTime) {
        const date = new Date(dateTime);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * Check if date is today
     */
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    /**
     * Navigation methods
     */
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    previousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.renderCalendar();
    }

    nextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.renderCalendar();
    }

    previousDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        this.renderCalendar();
    }

    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        this.renderCalendar();
    }

    /**
     * Select a date
     */
    selectDate(date) {
        this.selectedDate = date;
        this.viewMode = 'day';
        this.currentDate = new Date(date);
        this.renderCalendar();
    }

    /**
     * Switch view mode
     */
    switchViewMode(mode) {
        this.viewMode = mode;
        this.renderCalendar();
    }

    /**
     * Render calendar based on current view mode
     */
    renderCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        let html = `
            <div class="calendar-view-controls">
                <button class="view-mode-btn ${this.viewMode === 'month' ? 'active' : ''}" data-mode="month">Month</button>
                <button class="view-mode-btn ${this.viewMode === 'week' ? 'active' : ''}" data-mode="week">Week</button>
                <button class="view-mode-btn ${this.viewMode === 'day' ? 'active' : ''}" data-mode="day">Day</button>
                <button class="view-mode-btn" data-action="go-today">Today</button>
            </div>
        `;

        if (this.viewMode === 'month') {
            html += this.generateMonthView(this.currentDate.getFullYear(), this.currentDate.getMonth());
        } else if (this.viewMode === 'week') {
            html += this.generateWeekView(this.currentDate);
        } else if (this.viewMode === 'day') {
            html += this.generateDayView(this.currentDate);
        }

        container.innerHTML = html;

        // Attach event listeners (CSP-safe)
        // View mode buttons
        const modeBtns = container.querySelectorAll('.view-mode-btn[data-mode]');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchViewMode(btn.dataset.mode);
            });
        });

        // Today button
        const todayBtn = container.querySelector('.view-mode-btn[data-action="go-today"]');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => this.goToToday());
        }

        // Navigation buttons
        const navBtns = container.querySelectorAll('.calendar-nav-btn[data-action]');
        navBtns.forEach(btn => {
            const action = btn.dataset.action;
            btn.addEventListener('click', () => {
                switch (action) {
                    case 'prev-month': this.previousMonth(); break;
                    case 'next-month': this.nextMonth(); break;
                    case 'prev-week': this.previousWeek(); break;
                    case 'next-week': this.nextWeek(); break;
                    case 'prev-day': this.previousDay(); break;
                    case 'next-day': this.nextDay(); break;
                }
            });
        });

        // Month day cells
        const dayCells = container.querySelectorAll('.calendar-day[data-date]');
        dayCells.forEach(el => {
            el.addEventListener('click', () => {
                const parts = (el.dataset.date || '').split('-');
                if (parts.length === 3) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10) - 1;
                    const d = parseInt(parts[2], 10);
                    this.selectDate(new Date(y, m, d));
                }
            });
        });

        // Appointment click handlers (week/day views)
        const apptEls = container.querySelectorAll('.calendar-week-appointment[data-apt], .calendar-day-appointment[data-apt]');
        apptEls.forEach(el => {
            el.addEventListener('click', () => {
                try {
                    const json = (el.dataset.apt || '').replace(/&quot;/g, '"');
                    const apt = JSON.parse(json);
                    if (typeof window.openEditAppointmentModal === 'function') {
                        window.openEditAppointmentModal(apt);
                    }
                } catch (e) {
                    console.error('Failed to parse appointment data:', e);
                }
            });
        });
    }

    /**
     * Go to today
     */
    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.viewMode = 'month';
        this.renderCalendar();
    }
}

// Global calendar instance
window.calendarView = new CalendarView();

