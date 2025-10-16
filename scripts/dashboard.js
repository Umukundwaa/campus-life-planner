import { highlightText, compileRegex } from "./search.js";
import { getCurrentUser, clearCurrentUser } from "./storage.js";

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
            ? `<button class="delete-btn" data-index="${index}">Delete</button>`
            : `<button class="complete-btn" data-index="${index}">Mark Done</button>
               <button class="update-btn" data-index="${index}">Update</button>
               <button class="delete-btn" data-index="${index}">Delete</button>`}
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
  // get saved settings
  const Setting_Key =`settings_${currentUser.email}`;
  const defaultSettings ={
    theme: 'light',
    defaultDuration: 30,
    Notifications: false
  };
  // load user settings
  function loadSettings(){
    try{
      const rw = localStorage.getItem(Setting_Key);
      return rw ? JSON.parse(rw): {...defaultSettings};
    }
    catch(e){
      return {...defaultSettings};
    }
  }
  let userSettings = loadSettings();

  // Apply settings
  function applySettings(){
    // apply theme 
    if (userSettings.theme === 'dark'){
      document.body.classList.add('dark-mode');
    }
    else{
      document.body.classList.remove('dark-mode');
    }
    document.body.style.transition = "background 0.5s ease, color 0.5s ease";
 window.addEventListener('DOMContentLoaded', () => {
  const userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
  if (userSettings.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
});
    // populate inputs
    if(themeModeSelect) themeModeSelect.value = userSettings.theme || 'light';
    if(defaultDurationInput) defaultDurationInput.value = userSettings.defaultDuration ?? 30;
    if(notificationCheckbox) notificationCheckbox.checked = !! userSettings.Notifications;
}
    // save settings to local storage
    function saveSettings(){
        localStorage.setItem(Setting_Key, JSON.stringify(userSettings));
    }
    //theme mode change
    if(themeModeSelect){

      themeModeSelect.addEventListener("change", (e) => {
        userSettings.theme = e.target.value;
        applySettings();
        saveSettings();
    });
    }
    
    //default duration change
    if(defaultDurationInput){
      defaultDurationInput.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        if(!Number.isNaN(val)){
          userSettings.defaultDuration = val;
          saveSettings();
        }
    });

    }
    //notification toggle
    if (notificationCheckbox){
      notificationCheckbox.addEventListener("change", (e) => {
        userSettings.Notifications = e.target.checked;
        saveSettings();
    });
    }
    
    // reset dashboard
    if(resetDashboardBtn){
      resetDashboardBtn.addEventListener("click", () => {
        localStorage.removeItem(`tasks_${currentUser.email}`);
        location.reload();
    });
    }
    if(openSettingsBtn){
      openSettingsBtn.addEventListener("click" , () => {
        settingsSection.style.display = "block";
        showSection(settingsSection);
      });
    }

    // save button
    if(saveSettingsBtn){
      saveSettingsBtn.addEventListener('click', () =>{
        userSettings.theme = themeModeSelect?.value || userSettings.theme;
        userSettings.defaultDuration = parseInt(defaultDurationInput?.value || userSettings.defaultDuration, 10);
        userSettings.Notifications = !! notificationCheckbox?.checked;
        applySettings();
        saveSettings();
        alert("✅Settings saved successfully!");
       // close settings view
       renderDashboard();
       showSection(weeklyStatsCanvas);
      });
    }
    // close settings
    if(closeSettingsBtn){
      closeSettingsBtn.addEventListener("click", () => {
      showSection(weeklyStatsCanvas);
    });
    }
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