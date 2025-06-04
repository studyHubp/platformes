// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', function() {
  // List of protected pages
  const protectedPages = [
    'collaborate.html',
    'MCQ_.html',
    'StudyHub_AI.html'
  ];

  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop();

  // Check if current page is protected
  if (protectedPages.includes(currentPage)) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Store the current page to redirect back after login
      localStorage.setItem('redirectAfterLogin', currentPage);
      // Redirect to signup page
      window.location.href = 'signup.html';
    }
  }
});
