import { highlightText, compileRegex } from "./search.js";
import { getCurrentUser,clearCurrentUser} from "./storage.js";

document.addEventListener('DOMContentLoaded',()=>{
// DOM Elements
const userDisplay = document.getElementById('usernameDisplay');
const emailDisplayspan = document.getElementById('emailDisplayspan');

const totalTasksStat = document.getElementById('totalTasksStat');
const completedTasksStat = document.getElementById('completedTasksStat');
const upcomingEventsStat = document.getElementById('upcomingEventStat');
const moodSummary = document.getElementById('moodSummaryStat');

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

// current user session
const currentUser = getCurrentUser();
if (!currentUser){
    alert("No active session found. Please log in.");
    window.location.href='login.html';
    return;

}
// dispay user info
userDisplay.textContent = currentUser.username;
emailDisplayspan.textContent = currentUser.email;

// load tasks from local storage
let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.email}`)) || [];
let editIndex = null; //track the index of the task being edited
// save tasks to local storage
function saveTasks(){
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
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
        <td>${task.description}</td>
        <td>${task.date}</td>
        <td>${task.duration}</td>
        <td>${task.mood}</td>
        <td>${task.completed ? "✅Completed" : "⏳Pending"}</td>
        <td>${
            task.completed ?
            `<button class="delete-btn" data-index="${index}">Delete</button>` :
            ` <button class="complete-btn" data-index="${index}">Mark Done</button>
              <button class="update-btn" data-index="${index}">Update</button>
              <button class="delete-btn" data-index="${index}">Delete</button>`
        }
        </td>
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
        if(!task.completed && upcoming && task.title === upcoming.title){
            row.classList.add("upcoming"); 
     }
    }

        });
// update stats
    totalTasksStat.textContent = `Total Number of Task :  ${tasks.length}`;
    completedTasksStat.textContent = `Total Number of Completed Task:  ${completedCount}`;
    upcomingEventsStat.textContent = upcoming ? `Upcoming Task/Event:  ${upcoming.title} on ${upcoming.date}` : 'No upcoming tasks';
    moodSummary.textContent =
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
     // handle update button
    document.querySelectorAll(".update-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        const task = tasks[index];
        editIndex = index; //mark the task being edited

    // Populate the Add Task form with existing values
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("description").value =task.description;
    document.getElementById("taskDate").value = task.date;
    document.getElementById("taskTime").value = task.duration;
    document.getElementById("moodTag").value = task.mood;
    document.getElementById("description").value = task.description;

    addTaskSection.style.display = "block";
    // change submit button text to show "Update Task"
    document.querySelector("#taskForm button[type='submit']").textContent = "Update Task";

    });
    });
    
}
 renderDashboard();
   // task submission
   taskForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("taskDate").value;
    const duration = document.getElementById("taskTime").value;
    const mood = document.getElementById("moodTag").value;

    if(!title || !description|| !date || !duration || !mood ){
        alert("please fill in all fields!");
        return;
    }
    
    const newTask ={
        title, 
        description,
        date,
        duration,
        mood,
        completed: false,

    };
    // if editIndex is set, update the existing task
    if(editIndex !== null){
        tasks[editIndex]= newTask;
        editIndex = null; // reset after editing
        document.querySelector("#taskForm button[type='submit']").textContent = "Add Task"; // reset button text
    }
    else{
        tasks.push(newTask);
    }
    
    saveTasks();
    renderDashboard();

    taskForm.reset();
    addTaskSection.style.display ="none";
 });
// search functionality
const searchInput = document.getElementById("searchInput");
const searchError = document.getElementById("searchError");

searchInput.addEventListener("input", (e) =>{
    const query = e.target.value.trim();
    const regex = compileRegex(query, 'i');
    if(query && !regex){
        searchError.textContent = "Invalid regex pattern!";
        return;
    } else{
        searchError.textContent = "";
    }
    //filter task based on search
    const filtered = query ? tasks.filter(task => 
        regex.test(task.title) || 
        regex.test(task.description) ||
        regex.test(task.mood)
    ) : 
    tasks;
    //render only filtered tasks
    renderFilteredTasks(filtered, regex);
});
// render filtered tasks with highlights
function renderFilteredTasks(filteredTasks, regex){
    tasksTableBody.innerHTML = '';
    filteredTasks.forEach((task, index) => {
       const row = document.createElement('tr');
    row.innerHTML = `
      <td>${highlightText(task.title, regex)}</td>
      <td>${highlightText(task.description, regex)}</td>
      <td>${task.date}</td>
      <td>${task.duration}</td>
      <td>${highlightText(task.mood, regex)}</td>
      <td>${task.completed ? "✅Completed" : "⏳Pending"}</td>
    `;
    tasksTableBody.appendChild(row);
  });
}
 //Add new task
 addTaskBtn.addEventListener("click", () =>{
    addTaskSection.style.display="block";
 });

 cancelAddTaskBtn.addEventListener("click", () => {
    addTaskSection.style.display= "none";
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

});