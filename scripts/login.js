import { validateEmail, validatePassword } from "./validators.js";
import { getAllUsers, setCurrentUser } from "./storage.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginform = document.getElementById('login_form');
    if (!loginform) {
        console.error('Login form not found (id="login_form").');
        return;
    }

    loginform.addEventListener('submit', function (event) {
        event.preventDefault();
        const user_email = document.getElementById('email');
        const user_password = document.getElementById('password');
        if (!user_email || !user_password ) {
            console.error('Email or password input not found.');
            return;
        }

        const email = user_email.value.trim();
        const password = user_password.value.trim();
        // validation
        if (!validateEmail(email)) {
            alert("Please enter a valid email.");
            return;
        }
        if (!validatePassword(password)) {
            alert("Password must be at least 6 characters with letters and numbers.");
            return;
        }

        const users = getAllUsers();
        const user = users.find(function (theUser) {
            return theUser && theUser.email === email && theUser.password === password;
        });

        if (!user) {
            alert("Invalid email or password.❌");
            return;
        }

        // save session
        setCurrentUser(user);
        alert(`logged in successfully as ${user.username} ✅`);
        window.location.href = 'dashboard.html';
    });
});