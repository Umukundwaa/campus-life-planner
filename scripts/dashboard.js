import { highlightText, compileRegex } from "./search.js";
import { getCurrentUser, clearCurrentUser ,exportTasks, importTasks} from "./storage.js";

document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements
  const userDisplay = document.getElementById('usernameDisplay');
  const emailDisplayspan = document.getElementById('emailDisplayspan');

  const totalTasksStat = document.getElementById('totalTasksStat');
  const completedTasksStat = document.getElementById('completedTasksStat');
  const upcomingEventsStat = document.getElementById('upcomingEventStat');
  const totalDurationStat = document.getElementById('TotalDurationStat');

  const addTaskSection = document.getElementById('addTaskSection');
  const tasksListSection = document.getElementById('tasksListSection');
  const completedSection = document.querySelector('.completed-section');
  const weeklyStatsSection = document.querySelector('.weekly-stats');

  const addTaskBtn = document.getElementById('addTaskBtn');
  const viewTasksBtn = document.getElementById('viewTasksBtn');
  const viewCompletedBtn = document.getElementById('viewCompletedBtn');
  const cancelAddTaskBtn = document.getElementById('cancelAddTaskBtn');
  const closeTasksListBtn = document.getElementById('closeTasksListBtn');
  const closeCompletedTasksBtn = document.getElementById('closeCompletedTasksBtn');
  const weeklyTrackerBtn = document.getElementById('weeklyTrackerBtn');

  const taskForm = document.getElementById('taskForm');
  const tasksTableBody = document.getElementById('tasksTableBody');
  const completedTasksBody = document.getElementById('completedTasksBody');

  const logoutBtn = document.getElementById('logout-btn');
  const homeBtn = document.getElementById('homebtn');

  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const settingsSection = document.getElementById('settingsSection');
  const themeModeSelect = document.getElementById('themeMode');
  const defaultDurationInput = document.getElementById('defaultDuration');
  const notificationCheckbox = document.getElementById('notifications');
  const resetDashboardBtn = document.getElementById('resetDashboardBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  // Current user session
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("No active session found. Please log in.");
    window.location.href = 'login.html';
    return;
  }

  // Display user info
  userDisplay.textContent = currentUser.username;
  emailDisplayspan.textContent = currentUser.email;

  // Load tasks from local storage
  let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.email}`)) || [];
  let editIndex = null;

  function saveTasks() {
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
  }

  function renderDashboard() {
    tasksTableBody.innerHTML = '';
    completedTasksBody.innerHTML = '';

    let upcoming = null;
    let completedCount = 0;
    let TotalDuration = 0;
    let today = new Date();
    let created7days = 0;
    let completedLast7days = 0;
    const tasksCreatedPerDay = Array(7).fill(0);
    const tasksCompletedPerDay = Array(7).fill(0);
  // Canvas context
 const ctx = document.getElementById('weeklyStatsChart').getContext('2d');

// Labels for last 7 days
const labels = [];
for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
}

// Destroy previous chart if exists
if (window.weeklyChart) window.weeklyChart.destroy();

// Create new chart
 window.weeklyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Tasks Created',
                data: tasksCreatedPerDay,
                borderColor: 'rgba(54, 162, 235, 0.8)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.3,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            },
            {
                label: 'Tasks Completed',
                data: tasksCompletedPerDay,
                borderColor: 'rgba(75, 192, 192, 0.8)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }
        ]
    },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 5 },
        plugins: {
            legend: { display: true, position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } },
            title: { display: false },
            tooltip: { bodyFont: { size: 10 } }
        },
        interaction: { mode: 'nearest', intersect: false },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(200,200,200,0.2)' } },
            x: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(200,200,200,0.2)' } }
        }
    }
});


    tasks.forEach((task, index) => {
      const taskDate = new Date(task.date);
      const diffTime = (today - taskDate) / (1000 * 60 * 60 * 24);

      // Tasks created in last 7 days
      if (diffTime >= 0 && diffTime < 7) {
        created7days++;
        let dayIndex = 6 - Math.floor(diffTime);
        if (dayIndex >= 0 && dayIndex <= 6) tasksCreatedPerDay[dayIndex]++;
      }

      // Tasks completed in last 7 days
      if (task.completed && task.completedDate) {
        const completedDate = new Date(task.completedDate);
        const completedDiff = (today - completedDate) / (1000 * 60 * 60 * 24);
        if (completedDiff >= 0 && completedDiff < 7) {
          completedLast7days++;
          let completedDayIndex = 6 - Math.floor(completedDiff);
          if (completedDayIndex >= 0 && completedDayIndex <= 6) tasksCompletedPerDay[completedDayIndex]++;
        }
      }

      // Create table task row
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${task.title}</td>
        <td>${task.description}</td>
        <td>${task.date}</td>
        <td>${task.duration}</td>
        <td>${task.completed ? "✅Completed" : "⏳Pending"}</td>
        <td>
          ${task.completed
            ? `<button class="delete-btn" data-index="${index}">Delete</button>
            <button class="Export-btn" data-index="${index}">Export</button>`
            : `<button class="complete-btn" data-index="${index}">Mark Done</button>
               <button class="update-btn" data-index="${index}">Update</button>
               <button class="delete-btn" data-index="${index}">Delete</button>
               <button class="Export-btn" data-index="${index}">Export</button>`}
        </td>
      `;

      if (task.completed) {
        completedTasksBody.appendChild(row);
        completedCount++;
      } else {
        tasksTableBody.appendChild(row);
      }

      // Track total duration
      TotalDuration += parseInt(task.duration || 0, 10);

      // Find the earliest upcoming task
      if (!task.completed) {
        if (!upcoming || taskDate < new Date(upcoming.date)) {
          upcoming = task;
        }
        if (upcoming && task.title === upcoming.title) {
          row.classList.add("upcoming");
        }
      }
    });

    // Update stats
    if (totalTasksStat) totalTasksStat.querySelector("p").textContent = `${tasks.length}`;
    if (completedTasksStat) completedTasksStat.querySelector("p").textContent = `${completedCount}`;
    if (upcomingEventsStat) upcomingEventsStat.querySelector("p").textContent = upcoming ? `${upcoming.title} on ${upcoming.date}` : "No upcoming tasks";
    if (totalDurationStat) totalDurationStat.querySelector("p").textContent = `${TotalDuration} minutes`;

    // Handle buttons
    document.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        tasks[index].completed = true;
        tasks[index].completedDate = new Date().toISOString().split('T')[0];
        saveTasks();
        renderDashboard();
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        tasks.splice(index, 1);
        saveTasks();
        renderDashboard();
      });
    });

    document.querySelectorAll(".update-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        const task = tasks[index];
        editIndex = index;

        document.getElementById("taskTitle").value = task.title;
        document.getElementById("description").value = task.description;
        document.getElementById("taskDate").value = task.date;
        document.getElementById("taskTime").value = task.duration;

        addTaskSection.style.display = "block";
        document.querySelector("#taskForm button[type='submit']").textContent = "Update Task";
      });
    });
  }

  renderDashboard();

  // Task submission
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("taskDate").value;
    const duration = document.getElementById("taskTime").value;

    if (!title || !description || !date || !duration) {
      alert("Please fill in all fields!");
      return;
    }

    const newTask = { title, description, date, duration, completed: false };

    if (editIndex !== null) {
      tasks[editIndex] = newTask;
      editIndex = null;
      document.querySelector("#taskForm button[type='submit']").textContent = "Add Task";
    } else {
      tasks.push(newTask);
    }

    saveTasks();
    renderDashboard();
    taskForm.reset();
    addTaskSection.style.display = "none";
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  const searchError = document.getElementById("searchError");

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    const regex = compileRegex(query, 'i');
    if (query && !regex) {
      searchError.textContent = "Invalid regex pattern!";
      return;
    } else {
      searchError.textContent = "";
    }
    const filtered = query ? tasks.filter(task =>
      regex.test(task.title) || regex.test(task.description)
    ) : tasks;
    renderFilteredTasks(filtered, regex);
  });

  function renderFilteredTasks(filteredTasks, regex) {
    tasksTableBody.innerHTML = '';
    filteredTasks.forEach((task) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${highlightText(task.title, regex)}</td>
        <td>${highlightText(task.description, regex)}</td>
        <td>${task.date}</td>
        <td>${task.duration}</td>
        <td>${task.completed ? "✅Completed" : "⏳Pending"}</td>
      `;
      tasksTableBody.appendChild(row);
    });
  }
  const weeklyStatsCanvas = document.querySelector('.mini-chart-box');
  //    Settings Section 

const Setting_Key = `settings_${currentUser.email}`;
const exportBtn = document.getElementById('export-data');
const importInput = document.getElementById('import-data');
const clearDataBtn = document.getElementById('clear-data');

function loadSettings() {
    try {
        const saved = localStorage.getItem(Setting_Key);
        return saved ? JSON.parse(saved) : {
            theme: 'light',
            defaultDuration: 30,
            notifications: true
        };
    } catch (e) {
        return {
            theme: 'light',
            defaultDuration: 30,
            notifications: true
        };
    }
}

let userSettings = loadSettings();

// Apply settings
function applySettings() {
    // Theme
    if (userSettings.theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeModeSelect.value = 'dark';
    } else {
        document.body.classList.remove('dark-mode');
        themeModeSelect.value = 'light';
    }

    // Default Duration
    defaultDurationInput.value = userSettings.defaultDuration;

    // Notifications
    notificationCheckbox.checked = userSettings.notifications;
}

applySettings();

// Save settings
saveSettingsBtn.addEventListener('click', () => {
    userSettings.theme = themeModeSelect.value;
    userSettings.defaultDuration = parseInt(defaultDurationInput.value, 10);
    userSettings.notifications = notificationCheckbox.checked;

    localStorage.setItem(Setting_Key, JSON.stringify(userSettings));
    applySettings();
    alert("Settings saved successfully!");
});

// Close settings
closeSettingsBtn.addEventListener('click', () => {
    settingsSection.style.display = 'none';
});

// Reset dashboard
resetDashboardBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset all tasks and stats?")) {
        localStorage.removeItem(`tasks_${currentUser.email}`);
        tasks = [];
        renderDashboard();
        alert("Dashboard has been reset!");
    }
});
// Clear all data
clearDataBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all your tasks?")) {
        localStorage.removeItem(`tasks_${currentUser.email}`);
        tasks = [];
        renderDashboard();
        alert("All tasks have been cleared!");
    }
});

// Export button
exportBtn.addEventListener('click', () => exportTasks());

// Import file input
importInput.addEventListener('change', (e) => {
    if (!e.target.files[0]) return;
    importTasks(e.target.files[0]);
    e.target.value = ''; // reset input
});
// Open settings
openSettingsBtn.addEventListener('click', () => {
    settingsSection.style.display = 'block';
});

    // Show/Hide sections
    function showSection(section) {
    const sections = [addTaskSection, weeklyStatsCanvas,tasksListSection, completedSection,settingsSection];
    sections.forEach(sec => {
        if (sec) sec.style.display = (sec === section ? "block" : "none");
    });
}

// Buttons event listeners
  homeBtn.addEventListener("click", () => {
    showSection(null);
  }); 
 // weekly tracker button
 
  weeklyTrackerBtn.addEventListener("click", () => {
    renderDashboard();
    showSection(weeklyStatsCanvas);

  });
  // add task button
  addTaskBtn.addEventListener("click", () =>{
  showSection(addTaskSection);
 });
 document.querySelectorAll(".Export-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    const taskToExport = tasks[index];
    if (!taskToExport) {
      alert("Task not found!");
      return;
    }

    const dataStr = JSON.stringify(taskToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentUser.username}_${taskToExport.title}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`Task "${taskToExport.title}" exported successfully ✅`);
  });
});

 cancelAddTaskBtn.addEventListener("click", () => {
    addTaskSection.style.display= "none";
 });

 viewTasksBtn.addEventListener("click", () =>{
    showSection(tasksListSection);
 });

 closeTasksListBtn.addEventListener("click", () => {
    tasksListSection.style.display="none";
 });

 viewCompletedBtn.addEventListener("click", () =>{
    showSection(completedSection);
 });

 closeCompletedTasksBtn.addEventListener("click", () => {
    completedSection.style.display ="none";
 });

 //logout button
 logoutBtn.addEventListener("click", () =>{
    clearCurrentUser();
    window.location.href = 'login.html';
 });

  applySettings();
    
  });