
import { validateEmail, validateUsername,validatePassword} from "./validators.js";
document.addEventListener('DOMContentLoaded', () =>{

const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit',function(event){
event.preventDefault();
const username = document.getElementById('username').value.trim();
const email = document.getElementById('email').value.trim();
const password = document.getElementById('password').value.trim();
// validation
if (!validateUsername(username)) {
    alert("Username must be 3–25 characters long and can include letters, numbers, or spaces.");
    return;
}
if (!validateEmail(email)) {
    alert("Please enter a valid email address (e.g., user@example.com).");
    return;
} 
if(!validatePassword(password)){
    alert("Password must be at least 6 characters long.");
    return;
}
//get existing users or create new array
const users = JSON.parse(localStorage.getItem('users')) || [];

// check if email already exists
const existingUser = users.find(u => u.email === email);
if (existingUser){
    alert("An account with this email already exists.");
    return;
}
// add new user
const newUser = {username, email, password};
users.push(newUser);
localStorage.setItem('users', JSON.stringify(users));
alert("Account created successfully! You can now log in.");
window.location.href='login.html';
  });

});