// Check if user is logged in
function isAuthenticated() {
    // Check if user data exists in localStorage
    return localStorage.getItem('userData') !== null;
}

// Redirect to signup page if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        // Store the current page to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = 'signup.html';
        return false;
    }
    return true;
}

// Handle user login
function handleLogin(userData) {
    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Redirect to the stored URL or home page
    const redirectUrl = localStorage.getItem('redirectAfterLogin') || 'index.html';
    localStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectUrl;
}

// Handle user logout
function handleLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}
