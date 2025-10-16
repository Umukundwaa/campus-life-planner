// key for all users
export const USER_KEY= 'users';
// key for current logged in user
export const CURRENT_USER_KEY = 'currentUser';

// function to get all users from local storage
export function getAllUsers(){
    return JSON.parse(localStorage.getItem(USER_KEY)) || [];
}
// function to save all users to local storage
export function saveAllUsers(users){
    localStorage.setItem(USER_KEY, JSON.stringify(users));
}
// function to get current logged in user
export function getCurrentUser(){
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}
// function to set current logged in user
export function setCurrentUser(user){
    return localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}
// function to clear current logged in user
export function clearCurrentUser(){
    localStorage.removeItem(CURRENT_USER_KEY);
    alert(`You have been logged out successfully. ✅`);
    // redirect to login page
    window.location.href='login.html';
}
// import tasks
export function importTasks(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (!Array.isArray(importedTasks)) throw new Error("Invalid tasks file");

            const user = getCurrentUser();
            const tasks = JSON.parse(localStorage.getItem(`tasks_${user.email}`)) || [];
            const merged = [...tasks, ...importedTasks];
            localStorage.setItem(`tasks_${user.email}`, JSON.stringify(merged));

            alert("Tasks imported successfully ✅");
            window.location.reload();
        } catch (err) {
            alert("Failed to import tasks: " + err.message);
        }
    };
    reader.readAsText(file);
}
// export tasks
export function exportTasks() {
    const user = getCurrentUser();
    const tasks = JSON.parse(localStorage.getItem(`tasks_${user.email}`)) || [];
    if (!tasks.length) {
        alert("No tasks found to export.");
        return;
    }
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.username}_tasks.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert("Tasks exported successfully ✅");
}
