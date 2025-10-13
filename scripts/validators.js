export function validateEmail(email) {
    const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return EmailRegex.test(email);
}
export function validateUsername(username) {
    // Username validation — letters, spaces, numbers allowed (3–25 characters)
    const usernameRegex =/^[A-Za-z0-9 ]{3,25}$/;
    return usernameRegex.test(username);
}
export function validatePassword(password) {
   // Password validation — at least 6 characters, any type allowed
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
}