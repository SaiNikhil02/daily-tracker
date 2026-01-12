// State management
let timeSlots = [];
let editingSlotId = null;
let currentReflectionSlotId = null;
let selectedDate = new Date().toISOString().split('T')[0];

// DOM elements
const scheduleContainer = document.getElementById('scheduleContainer');
const emptyState = document.getElementById('emptyState');
const addTimeSlotBtn = document.getElementById('addTimeSlotBtn');
const endDayBtn = document.getElementById('endDayBtn');
const timeSlotModal = document.getElementById('timeSlotModal');
const endDayModal = document.getElementById('endDayModal');
const reflectionModal = document.getElementById('reflectionModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const timeSlotForm = document.getElementById('timeSlotForm');
const scoreElement = document.getElementById('score');
const cancelEndDayBtn = document.getElementById('cancelEndDayBtn');
const confirmEndDayBtn = document.getElementById('confirmEndDayBtn');
const selectedDateInput = document.getElementById('selectedDate');
const reflectionForm = document.getElementById('reflectionForm');
const closeReflectionModal = document.getElementById('closeReflectionModal');
const cancelReflectionBtn = document.getElementById('cancelReflectionBtn');
const weeklyAnalysisBtn = document.getElementById('weeklyAnalysisBtn');
const weeklyAnalysisModal = document.getElementById('weeklyAnalysisModal');
const closeWeeklyModal = document.getElementById('closeWeeklyModal');
const copyYesterdayBtn = document.getElementById('copyYesterdayBtn');
const streakElement = document.getElementById('streak');
const miniCalendarContainer = document.getElementById('miniCalendarContainer');

// Initialize
selectedDateInput.value = selectedDate;
loadData();
renderSchedule();
updateScore();
updateStreak();
renderMiniCalendar();
checkMissedSlots();
setInterval(checkMissedSlots, 60000); // Check every minute

// Event listeners
addTimeSlotBtn.addEventListener('click', () => openModal());
closeModal.addEventListener('click', closeTimeSlotModal);
cancelBtn.addEventListener('click', closeTimeSlotModal);
timeSlotForm.addEventListener('submit', handleTimeSlotSubmit);
endDayBtn.addEventListener('click', () => openEndDayModal());
cancelEndDayBtn.addEventListener('click', closeEndDayModal);
confirmEndDayBtn.addEventListener('click', handleEndDay);
selectedDateInput.addEventListener('change', handleDateChange);
reflectionForm.addEventListener('submit', handleReflectionSubmit);
closeReflectionModal.addEventListener('click', closeReflectionModalFunc);
cancelReflectionBtn.addEventListener('click', closeReflectionModalFunc);
weeklyAnalysisBtn.addEventListener('click', openWeeklyAnalysis);
closeWeeklyModal.addEventListener('click', closeWeeklyAnalysis);
copyYesterdayBtn.addEventListener('click', copyYesterdaySchedule);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === timeSlotModal) {
        closeTimeSlotModal();
    }
    if (e.target === endDayModal) {
        closeEndDayModal();
    }
    if (e.target === reflectionModal) {
        closeReflectionModalFunc();
    }
    if (e.target === weeklyAnalysisModal) {
        closeWeeklyAnalysis();
    }
});

// Tab switching for weekly analysis (delegated event listener)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
        const tabName = e.target.dataset.tab;
        if (tabName) {
            switchTab(tabName);
        }
    }
});

// Functions
function handleDateChange() {
    const previousDate = selectedDate;
    selectedDate = selectedDateInput.value;
    
    // Check if moving to next day (or any different day)
    if (previousDate !== selectedDate) {
        // Save current data before switching
        if (previousDate && timeSlots.length > 0) {
            saveDataForDate(previousDate);
        }
        
        // Load data for new date
        loadData();
        
        // If no tasks exist for this date, try to copy tasks from previous date but reset status
        if (timeSlots.length === 0 && previousDate) {
            const previousData = loadDataForDate(previousDate);
            if (previousData && previousData.length > 0) {
                // Copy tasks but reset status/reflections/partial
                timeSlots = previousData.map(slot => ({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    task: slot.task,
                    status: null,
                    partialCompletion: null,
                    reflection: null
                }));
                saveData();
            }
        }
    } else {
        loadData();
    }
    
    renderSchedule();
    updateScore();
    updateStreak();
    renderMiniCalendar();
    checkMissedSlots();
}

function openModal(slotId = null) {
    editingSlotId = slotId;
    const modalTitle = document.getElementById('modalTitle');
    
    if (slotId) {
        modalTitle.textContent = 'Edit Time Slot';
        const slot = timeSlots.find(s => s.id === slotId);
        document.getElementById('startTime').value = slot.startTime;
        document.getElementById('endTime').value = slot.endTime;
        document.getElementById('taskName').value = slot.task;
    } else {
        modalTitle.textContent = 'Add Time Slot';
        timeSlotForm.reset();
    }
    
    timeSlotModal.classList.add('show');
}

function closeTimeSlotModal() {
    timeSlotModal.classList.remove('show');
    editingSlotId = null;
    timeSlotForm.reset();
}

function openEndDayModal() {
    endDayModal.classList.add('show');
}

function closeEndDayModal() {
    endDayModal.classList.remove('show');
}

function openReflectionModal(slotId) {
    currentReflectionSlotId = slotId;
    const slot = timeSlots.find(s => s.id === slotId);
    document.getElementById('reflectionTaskName').textContent = slot.task;
    document.getElementById('reflectionText').value = slot.reflection || '';
    reflectionModal.classList.add('show');
}

function closeReflectionModalFunc() {
    reflectionModal.classList.remove('show');
    currentReflectionSlotId = null;
    reflectionForm.reset();
}

function handleTimeSlotSubmit(e) {
    e.preventDefault();
    
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const taskName = document.getElementById('taskName').value;
    
    // Validate time
    if (startTime >= endTime) {
        alert('End time must be after start time!');
        return;
    }
    
    if (editingSlotId) {
        // Update existing slot
        const slot = timeSlots.find(s => s.id === editingSlotId);
        slot.startTime = startTime;
        slot.endTime = endTime;
        slot.task = taskName;
        // Don't reset status/reflection/partial when editing task details
    } else {
        // Add new slot
        const newSlot = {
            id: Date.now().toString(),
            startTime: startTime,
            endTime: endTime,
            task: taskName,
            status: null, // null = not set, 'done' = done, 'not-done' = not done, 'missed' = missed
            partialCompletion: null, // 0-100 for partial completion
            reflection: null // Why not done reflection
        };
        timeSlots.push(newSlot);
    }
    
    // Sort by start time
    timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    saveData();
    renderSchedule();
    updateScore();
    updateStreak();
    renderMiniCalendar();
    checkMissedSlots();
    closeTimeSlotModal();
}

function handleStatusChange(slotId, status) {
    const slot = timeSlots.find(s => s.id === slotId);
    if (slot) {
        if (status === 'not-done') {
            // Open reflection modal for "not done"
            openReflectionModal(slotId);
        } else {
            slot.status = status;
            if (status === 'done') {
                slot.partialCompletion = null; // Clear partial if fully done
            }
            saveData();
            renderSchedule();
            updateScore();
            updateStreak();
            renderMiniCalendar();
        }
    }
}

function handleReflectionSubmit(e) {
    e.preventDefault();
    const reflectionText = document.getElementById('reflectionText').value;
    const slot = timeSlots.find(s => s.id === currentReflectionSlotId);
    if (slot) {
        slot.status = 'not-done';
        slot.reflection = reflectionText;
        saveData();
        renderSchedule();
        updateScore();
        updateStreak();
        renderMiniCalendar();
    }
    closeReflectionModalFunc();
}

function handlePartialCompletion(slotId, value) {
    const slot = timeSlots.find(s => s.id === slotId);
    if (slot) {
        slot.partialCompletion = parseInt(value);
        slot.status = 'partial';
        saveData();
        renderSchedule();
        updateScore();
        updateStreak();
        renderMiniCalendar();
    }
}

function deleteTimeSlot(slotId) {
    if (confirm('Are you sure you want to delete this time slot?')) {
        timeSlots = timeSlots.filter(s => s.id !== slotId);
        saveData();
        renderSchedule();
        updateScore();
        updateStreak();
        renderMiniCalendar();
    }
}

function checkMissedSlots() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];
    
    // Only check missed slots for today
    if (selectedDate !== today) {
        return;
    }
    
    let updated = false;
    timeSlots.forEach(slot => {
        // If time slot has passed and status is still null, mark as missed
        if (slot.endTime < currentTime && slot.status === null) {
            slot.status = 'missed';
            updated = true;
        }
    });
    
    if (updated) {
        saveData();
        renderSchedule();
        updateScore();
        updateStreak();
        renderMiniCalendar();
    }
}

function handleEndDay() {
    closeEndDayModal();
    
    // Reset only status, reflections, and partial completion - keep tasks
    timeSlots.forEach(slot => {
        slot.status = null;
        slot.reflection = null;
        slot.partialCompletion = null;
    });
    
    saveData();
    renderSchedule();
    updateScore();
    updateStreak();
    renderMiniCalendar();
    
    alert('Day ended! Tasks retained. All completion status, scores, and reflections have been reset. Ready for a new day!');
}

function renderSchedule() {
    scheduleContainer.innerHTML = '';
    
    if (timeSlots.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    timeSlots.forEach(slot => {
        const slotElement = createTimeSlotElement(slot);
        scheduleContainer.appendChild(slotElement);
    });
}

function createTimeSlotElement(slot) {
    const div = document.createElement('div');
    div.className = 'time-slot';
    
    const startTimeFormatted = formatTime(slot.startTime);
    const endTimeFormatted = formatTime(slot.endTime);
    
    // Add status class
    if (slot.status === 'missed') {
        div.classList.add('missed');
    } else if (slot.status === 'partial' || slot.partialCompletion) {
        div.classList.add('partial');
    } else if (slot.status === 'done') {
        div.classList.add('completed');
    }
    
    let statusButtonsHTML = '';
    let partialHTML = '';
    let reflectionHTML = '';
    
    // Always show all three buttons for ALL tasks
    // This allows users to change status at any time
    statusButtonsHTML = `
        <button class="status-btn ${slot.status === 'done' ? 'done' : ''}" 
                onclick="handleStatusChange('${slot.id}', 'done')">
            ✓ Done
        </button>
        <button class="status-btn ${slot.status === 'not-done' ? 'not-done' : ''}" 
                onclick="handleStatusChange('${slot.id}', 'not-done')">
            ✗ Not Done
        </button>
        <button class="status-btn ${slot.status === 'partial' || slot.partialCompletion !== null ? '' : ''}" 
                onclick="handlePartialCompletion('${slot.id}', 50); renderSchedule(); updateScore(); updateStreak(); renderMiniCalendar();" 
                style="background: rgba(242, 201, 76, 0.1); border-color: rgba(242, 201, 76, 0.3); color: #856404;">
            ⚡ Partial
        </button>
    `;
    
    // Show partial completion slider if task is marked as partial
    if (slot.status === 'partial' || slot.partialCompletion !== null) {
        const partialValue = slot.partialCompletion || 0;
        partialHTML = `
            <div class="partial-completion">
                <div class="partial-completion-label">
                    <span>Partial Completion:</span>
                    <span id="partialValue${slot.id}">${partialValue}%</span>
                </div>
                <input type="range" min="0" max="100" value="${partialValue}" 
                       class="partial-slider" 
                       oninput="handlePartialCompletion('${slot.id}', this.value); const span = document.querySelector('#partialValue${slot.id}'); if(span) span.textContent = this.value + '%'">
            </div>
        `;
    }
    
    // Show reflection for missed or not-done tasks
    if (slot.status === 'missed') {
        if (slot.reflection) {
            reflectionHTML = `
                <div class="reflection-section">
                    <div class="reflection-label">Why Not Done?</div>
                    <div class="reflection-text">${slot.reflection}</div>
                </div>
            `;
        } else {
            reflectionHTML = `
                <button class="btn btn-secondary" onclick="openReflectionModal('${slot.id}')" style="margin-top: 12px; width: 100%;">
                    Add Reflection
                </button>
            `;
        }
    }
    
    // Show reflection for not-done tasks
    if (slot.status === 'not-done' && slot.reflection) {
        reflectionHTML = `
            <div class="reflection-section">
                <div class="reflection-label">Why Not Done?</div>
                <div class="reflection-text">${slot.reflection}</div>
                <button class="btn btn-secondary" onclick="openReflectionModal('${slot.id}')" style="margin-top: 8px; width: 100%;">
                    Edit Reflection
                </button>
            </div>
        `;
    }
    
    div.innerHTML = `
        <div class="time-slot-header">
            <div class="time-range">${startTimeFormatted} - ${endTimeFormatted}</div>
            <div class="time-slot-actions">
                <button class="btn btn-secondary" onclick="openModal('${slot.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteTimeSlot('${slot.id}')">Delete</button>
            </div>
        </div>
        <div class="task-name">${slot.task}</div>
        <div class="status-buttons">
            ${statusButtonsHTML}
        </div>
        ${partialHTML}
        ${reflectionHTML}
    `;
    
    return div;
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function updateScore() {
    if (timeSlots.length === 0) {
        scoreElement.textContent = '0%';
        scoreElement.style.color = '#dc3545';
        return;
    }
    
    let totalScore = 0;
    let totalPossible = timeSlots.length * 100; // Each task worth 100 points
    
    timeSlots.forEach(slot => {
        if (slot.status === 'missed') {
            // Missed = 0 points
            totalScore += 0;
        } else if (slot.status === 'done') {
            // Fully done = 100 points
            totalScore += 100;
        } else if (slot.status === 'partial' && slot.partialCompletion !== null) {
            // Partial = percentage points
            totalScore += slot.partialCompletion;
        } else if (slot.status === 'not-done') {
            // Not done = 0 points
            totalScore += 0;
        } else {
            // Not set yet = 0 points (will be missed if time passes)
            totalScore += 0;
        }
    });
    
    const percentage = Math.round((totalScore / totalPossible) * 100);
    
    scoreElement.textContent = `${percentage}%`;
    
    // Update color based on score
    if (percentage >= 80) {
        scoreElement.style.color = '#28a745';
    } else if (percentage >= 50) {
        scoreElement.style.color = '#ffc107';
    } else {
        scoreElement.style.color = '#dc3545';
    }
}

function updateStreak() {
    const allData = getAllData();
    const today = new Date();
    let streak = 0;
    const streakThreshold = 80; // Minimum score to count as a "day" for streak
    
    // Count backwards from today
    for (let i = 0; i < 365; i++) { // Check up to a year
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (allData[dateStr] && allData[dateStr].timeSlots) {
            const slots = allData[dateStr].timeSlots;
            if (slots.length === 0) break; // No tasks = no streak
            
            // Calculate score for this day
            let totalScore = 0;
            let totalPossible = slots.length * 100;
            
            slots.forEach(slot => {
                if (slot.status === 'missed') {
                    totalScore += 0;
                } else if (slot.status === 'done') {
                    totalScore += 100;
                } else if (slot.status === 'partial' && slot.partialCompletion !== null) {
                    totalScore += slot.partialCompletion;
                } else if (slot.status === 'not-done') {
                    totalScore += 0;
                } else {
                    totalScore += 0;
                }
            });
            
            const percentage = Math.round((totalScore / totalPossible) * 100);
            
            if (percentage >= streakThreshold) {
                streak++;
            } else {
                break; // Streak broken
            }
        } else {
            break; // No data for this day = streak broken
        }
    }
    
    streakElement.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
}

function copyYesterdaySchedule() {
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayData = loadDataForDate(yesterdayStr);
    
    if (yesterdayData.length === 0) {
        alert('No schedule found for yesterday. Please create tasks first.');
        return;
    }
    
    if (confirm(`Copy ${yesterdayData.length} task(s) from yesterday to today?`)) {
        // Copy tasks but reset status
        timeSlots = yesterdayData.map(slot => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            startTime: slot.startTime,
            endTime: slot.endTime,
            task: slot.task,
            status: null,
            partialCompletion: null,
            reflection: null
        }));
        
        saveData();
        renderSchedule();
        updateScore();
        renderMiniCalendar();
        alert('Schedule copied from yesterday!');
    }
}

function renderMiniCalendar() {
    const today = new Date();
    const currentMonth = new Date(selectedDate);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const allData = getAllData();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = '<table class="mini-calendar">';
    
    // Day headers
    html += '<thead><tr class="mini-calendar-header">';
    dayNames.forEach(day => {
        html += `<th class="mini-calendar-day-header">${day}</th>`;
    });
    html += '</tr></thead>';
    
    // Calendar days - organized into weeks (rows)
    html += '<tbody class="mini-calendar-days">';
    
    let currentDay = 1;
    let dayOfWeek = startingDayOfWeek;
    
    // Calculate how many weeks we need
    const totalCells = startingDayOfWeek + daysInMonth;
    const weeksNeeded = Math.ceil(totalCells / 7);
    
    for (let week = 0; week < weeksNeeded; week++) {
        html += '<tr class="mini-calendar-week">';
        
        for (let day = 0; day < 7; day++) {
            let dateStr = '';
            let dayNumber = '';
            let classes = 'mini-calendar-day';
            let isOtherMonthDay = false;
            
            if (week === 0 && day < startingDayOfWeek) {
                // Days from previous month
                const prevMonth = new Date(year, month, 0);
                const prevMonthDays = prevMonth.getDate();
                const prevDay = prevMonthDays - (startingDayOfWeek - day - 1);
                const prevDate = new Date(year, month - 1, prevDay);
                dateStr = prevDate.toISOString().split('T')[0];
                dayNumber = prevDay;
                classes += ' other-month';
                isOtherMonthDay = true;
            } else if (currentDay > daysInMonth) {
                // Days from next month
                const nextDay = currentDay - daysInMonth;
                const nextDate = new Date(year, month + 1, nextDay);
                dateStr = nextDate.toISOString().split('T')[0];
                dayNumber = nextDay;
                classes += ' other-month';
                isOtherMonthDay = true;
            } else {
                // Current month days
                dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
                dayNumber = currentDay;
                
                const dateObj = new Date(year, month, currentDay);
                const isToday = dateStr === today.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                
                if (isToday) classes += ' today';
                if (isSelected) classes += ' selected';
                
                // Get score for this day
                if (allData[dateStr] && allData[dateStr].timeSlots) {
                    const slots = allData[dateStr].timeSlots;
                    if (slots.length > 0) {
                        classes += ' has-data';
                        
                        let totalScore = 0;
                        let totalPossible = slots.length * 100;
                        
                        slots.forEach(slot => {
                            if (slot.status === 'missed') {
                                totalScore += 0;
                            } else if (slot.status === 'done') {
                                totalScore += 100;
                            } else if (slot.status === 'partial' && slot.partialCompletion !== null) {
                                totalScore += slot.partialCompletion;
                            } else if (slot.status === 'not-done') {
                                totalScore += 0;
                            } else {
                                totalScore += 0;
                            }
                        });
                        
                        const score = Math.round((totalScore / totalPossible) * 100);
                        
                        if (score >= 80) {
                            classes += ' score-excellent';
                        } else if (score >= 50) {
                            classes += ' score-good';
                        } else {
                            classes += ' score-poor';
                        }
                    }
                }
                
                currentDay++;
            }
            
            const onclickAttr = isOtherMonthDay ? '' : `onclick="selectDateFromCalendar('${dateStr}')"`;
            html += `<td class="${classes}" data-date="${dateStr}" ${onclickAttr}>${dayNumber}</td>`;
        }
        
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    
    miniCalendarContainer.innerHTML = html;
}

function isOtherMonth(date, currentMonth) {
    return date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear();
}

function selectDateFromCalendar(dateStr) {
    selectedDateInput.value = dateStr;
    handleDateChange();
    renderMiniCalendar();
}

function saveData() {
    saveDataForDate(selectedDate);
}

function saveDataForDate(date) {
    const allData = getAllData();
    allData[date] = {
        timeSlots: timeSlots,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('dailyTracker', JSON.stringify(allData));
}

function loadData() {
    const allData = getAllData();
    if (allData[selectedDate]) {
        timeSlots = allData[selectedDate].timeSlots || [];
    } else {
        timeSlots = [];
    }
}

function loadDataForDate(date) {
    const allData = getAllData();
    if (allData[date]) {
        return allData[date].timeSlots || [];
    }
    return [];
}

function getAllData() {
    const saved = localStorage.getItem('dailyTracker');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // If old format (single date), convert to new format
            if (data.selectedDate || data.timeSlots) {
                const oldDate = data.selectedDate || new Date(data.lastUpdated).toISOString().split('T')[0];
                return {
                    [oldDate]: {
                        timeSlots: data.timeSlots || [],
                        lastUpdated: data.lastUpdated || new Date().toISOString()
                    }
                };
            }
            return data;
        } catch (e) {
            console.error('Error loading data:', e);
            return {};
        }
    }
    return {};
}

function openWeeklyAnalysis() {
    weeklyAnalysisModal.classList.add('show');
    loadWeeklyAnalysis();
}

function closeWeeklyAnalysis() {
    weeklyAnalysisModal.classList.remove('show');
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(tabName + 'Content');
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

function loadWeeklyAnalysis() {
    const allData = getAllData();
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const partialTasks = [];
    const undoneTasks = [];
    const missedTasks = [];
    
    // Iterate through all dates in the last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (allData[dateStr]) {
            allData[dateStr].timeSlots.forEach(slot => {
                const dateObj = new Date(dateStr);
                const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const timeRange = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
                
                if (slot.status === 'partial' && slot.partialCompletion !== null) {
                    partialTasks.push({
                        task: slot.task,
                        date: formattedDate,
                        time: timeRange,
                        completion: slot.partialCompletion,
                        reflection: slot.reflection || 'No reflection provided'
                    });
                } else if (slot.status === 'not-done') {
                    undoneTasks.push({
                        task: slot.task,
                        date: formattedDate,
                        time: timeRange,
                        reflection: slot.reflection || 'No reflection provided'
                    });
                } else if (slot.status === 'missed') {
                    missedTasks.push({
                        task: slot.task,
                        date: formattedDate,
                        time: timeRange,
                        reflection: slot.reflection || 'No reflection provided'
                    });
                }
            });
        }
    }
    
    renderAnalysisList('partialList', partialTasks, 'partial');
    renderAnalysisList('undoneList', undoneTasks, 'undone');
    renderAnalysisList('missedList', missedTasks, 'missed');
}

function renderAnalysisList(listId, items, type) {
    const listElement = document.getElementById(listId);
    
    if (items.length === 0) {
        listElement.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: rgba(55, 53, 47, 0.4);">No ${type} tasks found in the last 7 days.</div>`;
        return;
    }
    
    listElement.innerHTML = items.map(item => {
        let extraInfo = '';
        if (type === 'partial') {
            extraInfo = `<div class="analysis-item-partial">Completion: ${item.completion}%</div>`;
        }
        
        return `
            <div class="analysis-item ${type}">
                <div class="analysis-item-header">
                    <div>
                        <div class="analysis-item-task">${item.task}</div>
                        <div class="analysis-item-time">${item.time}</div>
                    </div>
                    <div class="analysis-item-date">${item.date}</div>
                </div>
                ${extraInfo}
                <div class="analysis-item-reason">${item.reflection}</div>
            </div>
        `;
    }).join('');
}

// Make functions available globally for onclick handlers
window.openModal = openModal;
window.handleStatusChange = handleStatusChange;
window.deleteTimeSlot = deleteTimeSlot;
window.handlePartialCompletion = handlePartialCompletion;
window.openReflectionModal = openReflectionModal;
window.selectDateFromCalendar = selectDateFromCalendar;