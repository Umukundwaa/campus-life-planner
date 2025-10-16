📒 Campus Life Planner
Overview

Campus Life Planner is a web-based task and event management application designed for students to track assignments, meetings, and personal tasks. It helps users plan their week, monitor task completion, and manage their workflow efficiently.

The app emphasizes accessibility, keyboard navigation, and regex-powered search for flexible filtering.

🌈 Theme

Chosen Theme: Light / Dark toggle available in settings.

Users can switch between light and dark modes dynamically.

✨ Features

Dashboard

Quick overview: total tasks, completed tasks, upcoming event, total duration.

Weekly tracker chart showing tasks created vs completed over 7 days.

Task Management

Add, update, and delete tasks.

Mark tasks as completed.

Search tasks using regex patterns.

Settings

Theme mode toggle (Light/Dark).

Default task duration configuration.

Enable or disable notifications.

Import and export tasks as JSON.

Reset dashboard or clear all data.

User Management

Current user display with username and email.

Logout functionality.

Accessibility & UX

Keyboard-friendly navigation.

Focused visual indicators for interactive elements.

Error handling and alerts for invalid inputs.

🧩 Regex Catalog
Pattern	Example	Description
^Meet	Meet with team	Matches tasks that start with "Meet"
\bstudy\b	I will study	Matches whole word "study"
[A-Za-z0-9]+	Task123	Matches alphanumeric characters
^\d{4}-\d{2}-\d{2}$	2025-10-16	Validates date in YYYY-MM-DD format
[!@#$%^&*]	Fix bugs!	Detects special characters in description

Note: Users can experiment with more patterns in the search input for dynamic filtering.

⌨️ Keyboard Map

Tab: Navigate between buttons, input fields, and links.

Enter: Activate focused buttons or submit forms.

Escape: Close modals (Add Task, Settings, Task Lists).

Arrow Keys: Navigate table rows (optional with extensions).

♿ Accessibility Notes

Color contrast tested for light and dark mode.

Focus states added to interactive elements.

ARIA labels used for buttons where necessary.

Alerts provided for invalid inputs, missing fields, or successful actions.

💻 How It Works

Loading the App

Open index.html in a browser.

If no user session exists, login is required.

Seed data can be loaded from data/seed.json for testing.

Dashboard Overview

Shows statistics: total tasks, completed tasks, upcoming task, total duration.

Buttons allow navigation to add tasks, view tasks, completed tasks, weekly tracker, or settings.

Managing Tasks

Click Add Task/Event to create a new task.

Click Update to edit an existing task.

Click Mark Done to complete a task.

Use the Delete button to remove tasks permanently.

Search tasks dynamically using regex patterns.

Weekly Tracker

Graphical chart showing tasks created and completed over the last 7 days.

Settings

Toggle theme mode between light and dark.

Set default task duration.

Enable or disable notifications.

Export tasks to JSON.

Import tasks from JSON (updates local storage).

Reset dashboard to clear all stats.

Close and save settings.

User Session

Current user info is displayed on the header.

Logout clears current session and redirects to login.

📝 How to Use / Run Locally

Clone the repo:

git clone <your-repo-url>


Navigate to the project folder:

cd campus-life-planner


Open index.html in your browser.

Optional: Load seed.json to prefill user and tasks:

fetch('data/seed.json')
  .then(response => response.json())
  .then(data => {
    localStorage.setItem('users', JSON.stringify(data.users));
    console.log('✅ Seed data loaded successfully!');
  })
  .catch(error => console.error('Error loading seed.json:', error));


Use the dashboard buttons to navigate, add tasks, and adjust settings.

🎬 Demo Video

Unlisted YouTube video demonstrating:

Keyboard navigation

Regex search edge cases

Import/export JSON functionality

link: 

🔧 Notes

LocalStorage is used for storing users, tasks, and settings.

Supports modern browsers with JavaScript ES6 modules.

Chart.js used for weekly tracker visualization.