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