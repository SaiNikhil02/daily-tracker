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
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const syncGistBtn = document.getElementById('syncGistBtn');
const gistSetupModal = document.getElementById('gistSetupModal');
const gistSetupForm = document.getElementById('gistSetupForm');
const closeGistModal = document.getElementById('closeGistModal');
const cancelGistBtn = document.getElementById('cancelGistBtn');
const gistStatus = document.getElementById('gistStatus');
const gistStatusText = document.getElementById('gistStatusText');

// Gist configuration
let gistConfig = {
    token: localStorage.getItem('githubToken') || null,
    gistId: localStorage.getItem('gistId') || null
};

// Initialize
selectedDateInput.value = selectedDate;

// Load from Gist on startup if configured
(async () => {
    if (gistConfig.token && gistConfig.gistId) {
        const loaded = await loadFromGist();
        if (loaded) {
            console.log('Data loaded from Gist');
        }
    }
    
    loadData();
    renderSchedule();
    updateScore();
    updateStreak();
    renderMiniCalendar();
    checkMissedSlots();
    setInterval(checkMissedSlots, 60000); // Check every minute
})();

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
exportDataBtn.addEventListener('click', exportData);
importDataBtn.addEventListener('click', importData);
syncGistBtn.addEventListener('click', () => {
    if (gistConfig.token) {
        syncToGist();
    } else {
        openGistSetup();
    }
});
gistSetupForm.addEventListener('submit', handleGistSetup);
closeGistModal.addEventListener('click', closeGistSetup);
cancelGistBtn.addEventListener('click', closeGistSetup);

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
    if (e.target === gistSetupModal) {
        closeGistSetup();
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

function exportData() {
    const allData = getAllData();
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('Data exported successfully! Save this file to import it in another browser.');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (confirm('This will replace all your current data. Are you sure?')) {
                    // Merge imported data with existing data
                    const existingData = getAllData();
                    const mergedData = { ...existingData, ...importedData };
                    
                    localStorage.setItem('dailyTracker', JSON.stringify(mergedData));
                    
                    // Reload current date's data
                    loadData();
                    renderSchedule();
                    updateScore();
                    updateStreak();
                    renderMiniCalendar();
                    
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function openGistSetup() {
    document.getElementById('githubToken').value = gistConfig.token || '';
    document.getElementById('gistId').value = gistConfig.gistId || '';
    gistStatus.style.display = 'none';
    gistSetupModal.classList.add('show');
}

function closeGistSetup() {
    gistSetupModal.classList.remove('show');
    gistSetupForm.reset();
}

async function handleGistSetup(e) {
    e.preventDefault();
    const token = document.getElementById('githubToken').value.trim();
    const gistId = document.getElementById('gistId').value.trim();
    
    if (!token) {
        alert('Please enter a GitHub Personal Access Token');
        return;
    }
    
    gistConfig.token = token;
    gistConfig.gistId = gistId || null;
    
    // Save to localStorage
    localStorage.setItem('githubToken', token);
    if (gistId) {
        localStorage.setItem('gistId', gistId);
    }
    
    gistStatus.style.display = 'block';
    gistStatusText.textContent = 'Testing connection...';
    gistStatusText.style.color = 'rgba(55, 53, 47, 0.8)';
    
    try {
        // Test token and sync
        await syncToGist();
        gistStatusText.textContent = '✅ Connected! Data synced successfully.';
        gistStatusText.style.color = '#27ae60';
        setTimeout(() => {
            closeGistSetup();
        }, 1500);
    } catch (error) {
        gistStatusText.textContent = '❌ Error: ' + error.message;
        gistStatusText.style.color = '#eb5757';
    }
}

async function syncToGist() {
    if (!gistConfig.token) {
        openGistSetup();
        return;
    }
    
    const allData = getAllData();
    const dataStr = JSON.stringify(allData, null, 2);
    
    const gistData = {
        description: 'Daily Schedule Tracker - Auto-synced data',
        public: false,
        files: {
            'daily-tracker-data.json': {
                content: dataStr
            }
        }
    };
    
    try {
        let response;
        
        if (gistConfig.gistId) {
            // Update existing Gist
            response = await fetch(`https://api.github.com/gists/${gistConfig.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${gistConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
        } else {
            // Create new Gist
            response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${gistConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to sync to Gist');
        }
        
        const result = await response.json();
        
        // Save Gist ID if it's new
        if (!gistConfig.gistId && result.id) {
            gistConfig.gistId = result.id;
            localStorage.setItem('gistId', result.id);
        }
        
        // Update button text
        syncGistBtn.textContent = '☁️ Synced';
        syncGistBtn.style.background = 'rgba(39, 174, 96, 0.1)';
        syncGistBtn.style.borderColor = 'rgba(39, 174, 96, 0.3)';
        syncGistBtn.style.color = '#27ae60';
        
        setTimeout(() => {
            syncGistBtn.textContent = '☁️ Sync to Gist';
            syncGistBtn.style.background = '';
            syncGistBtn.style.borderColor = '';
            syncGistBtn.style.color = '';
        }, 2000);
        
        return result;
    } catch (error) {
        console.error('Gist sync error:', error);
        throw error;
    }
}

async function loadFromGist() {
    if (!gistConfig.token || !gistConfig.gistId) {
        return false;
    }
    
    try {
        const response = await fetch(`https://api.github.com/gists/${gistConfig.gistId}`, {
            headers: {
                'Authorization': `token ${gistConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load from Gist');
        }
        
        const gist = await response.json();
        const file = gist.files['daily-tracker-data.json'];
        
        if (file && file.content) {
            const importedData = JSON.parse(file.content);
            
            // Merge with existing data
            const existingData = getAllData();
            const mergedData = { ...existingData, ...importedData };
            
            localStorage.setItem('dailyTracker', JSON.stringify(mergedData));
            
            // Reload current date
            loadData();
            renderSchedule();
            updateScore();
            updateStreak();
            renderMiniCalendar();
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Gist load error:', error);
        return false;
    }
}

function saveData() {
    saveDataForDate(selectedDate);
    
    // Auto-sync to Gist if configured
    if (gistConfig.token && gistConfig.gistId) {
        syncToGist().catch(err => {
            console.error('Auto-sync failed:', err);
        });
    }
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