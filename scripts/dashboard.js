import { getCurrentUser,clearCurrentUser} from "./storage.js";

document.addEventListener('DOMContentLoaded',()=>{
// DOM Elements
const userDisplay = document.getElementById('usernameDisplay');
const emailDisplayspan = document.getElementById('emailDisplayspan');

const totalTasksStat = document.getElementById('totalTasks');
const completedTasksStat = document.getElementById('completedTasks');
const upcomingEventsStat = document.getElementById('upcomingEvents');
const moodSummary = document.getElementById('moodSummary');

const addTaskSection = document.getElementById('addTaskSection');
const tasksListSection = document.getElementById('tasksListSection');
const completedSection = document.querySelector('.completed-section');

const addTaskBtn = document.getElementById('addTaskBtn');
const viewTasksBtn = document.getElementById('viewTasksBtn');
const viewCompletedBtn = document.getElementById('viewCompletedBtn');
const cancelAddTaskBtn = document.getElementById('cancelAddTaskBtn');
const closeTasksListBtn = document.getElementById('closeTasksListBtn');
const closeCompletedTasksBtn = document.getElementById('closeCompletedTasksBtn');

const taskForm = document.getElementById('taskForm');
const tasksTableBody = document.getElementById('tasksTableBody');
const completedTasksBody = document.getElementById('completedTasksBody');

const logoutBtn = document.getElementById('logout-btn');
const homeBtn = document.getElementById('homebtn');
const logo = document.querySelector('.logo h1');

// current user session
const currentUser = getCurrentUser();
if (!currentUser){
    alert("No active session found. Please log in.");
    window.location.href='login.html';
    return;

}
// dispay user info
userDisplay.texContent = currentUser.username;
emailDisplayspan.textContent = currentUser.email;

// load tasks from local storage
let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.email}`)) || [];
function saveTasks(){
    localStorage.setItem(`tasks_${currentUser.email}`, jstringify(tasks));
}
// render dashboard stats and tables
function renderDashboard(){
    tasksTableBody.innerHTML = '';
    completedTasksBody.innerHTML = '';

    let upcoming = null;
    let completedCount = 0;
    let moodCounts = {};

    tasks.forEach((task, index) => {
        // create table task row
    const row = document.createElement('tr');
    row.innerHTML =`
        <td>${task.title}</td>
        <td>${task.date}</td>
        <td>${task.duration}</td>
        <td>${task.mood}</td>
        <td>${task.completed ? "✅Completed" : "⏳Pending"}</td>
        <td>${
            task.completed ?
            `<button class="delete-btn" data-index="${index}">Delete</button>` :
            `<button class="complete-btn" data-index="${index}">Mark Done</button>`
        }</td>
    `;
    if(task.completed){
        completedTasksBody.appendChild(row);
        completedCount++;
    }
    else{
        tasksTableBody.appendChild(row);
    }
    // mood count
    moodCounts[task.mood]= (moodCounts[task.mood] || 0) + 1;

    // find the earliest upcoming task
    if(!task.completed){
        const taskDate = new Date(task.date);
        if(!upcoming || taskDate < new Date(upcoming.date)){
            upcoming = task;
        }
    }

        });
// update stats
    totalTasksStat.textContent = tasks.length;
    completedTasksStat.textContent = completedCount;
    upcomingEventsStas.texContent = upcoming ? `${upcoming.title} on ${upcoming.date}` : 'No upcoming tasks';
    moodSummary.texContent =
     Object.entries(moodCounts)
     .map(([mood, count]) => `${mood}: ${count}`)
     .join(', ') || 'No moods🥱😏 yet';

     // handle buttons (complete & delete)
     document.querySelectorAll(".complete-btn").forEach((btn) =>{
       btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        tasks[index].completed = true;
        saveTasks();
        renderDashboard();
    });
    });
    
    

     document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) =>{
            const index = e.target.dataset.index;
            tasks.splice(index, 1);
            saveTasks();
            renderDashboard();
        });
     });
}
 renderDashboard();

 //Add new task
 addTaskBtn.addEventListener("click", () =>{
    addTaskSection.style.display="block";
 });

 cancelAddTaskBtn.addEventListener("click", () => {
    addTaskSection.style,display= "none";
 });

 viewTasksBtn.addEventListener("click", () =>{
    tasksListSection.style.display="block";
 });

 closeTasksListBtn.addEventListener("click", () => {
    tasksListSection.style.display="none";
 });

 viewCompletedBtn.addEventListener("click", () =>{
    completedSection.style.display = "block";
 });

 closeCompletedTasksBtn.addEventListener("click", () => {
    completedSection.style.display ="none";
 });

 // task submission
 taskForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    const title = document.getElementById("taskTitle").Value.trim();
    const date = document.getElementById("taskDate").Value;
    const duration = document.getElementById("taskTime").value;
    const mood = document.getElementById("moodTag").value;

    if(!title || !date || !duration || !mood ){
        alert("please fill in all fields!");
        return;
    }
    
    const newTask ={
        title, 
        date,
        duration,
        mood,
        completed: false,

    };
    tasks.push(newTask);
    saveTasks();
    renderDashboard();

    taskForm.reset();
    addTaskSection.style.display ="none";
 });

 //logout button
 logoutBtn.addEventListener("click", () =>{
    clearCurrentUser();
 });

 // home button(reload dashboard)
 homeBtn.addEventListener("click", () => {
    renderDashboard();
    tasksListSection.style.display ="none";
    completedSection.style.display ="none";
    addTaskSection.style.display = "none"; 
 });
 // logo h1 (reload landing page)
 
});