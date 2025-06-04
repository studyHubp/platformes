// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when clicking on a nav link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Close menu when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.hamburger')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation on scroll for feature cards
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .benefit-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Modal functionality
const modal = document.getElementById('signup-modal');
const closeBtn = document.querySelector('.close');
const signupForm = document.getElementById('signup-form');

// Open modal on "Get Started" click
document.querySelector('.cta-btn').addEventListener('click', () => {
    modal.style.display = 'block';
});

// Close modal on X click
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullname,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Sign up failed');
        }

        alert('Sign up successful! Welcome to StudyMate!');
        modal.style.display = 'none';
        signupForm.reset();
    } catch (error) {
        alert(error.message || 'An error occurred during sign up. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful! Please login.');
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Error during signup');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server');
        }
    });
});

// Check if all functions are ready
function checkFunctionsReady() {
    return true; // Replace with actual checks
}

// Enable 'Get Started' button if all functions are ready
const getStartedBtn = document.querySelector('.cta-btn');
if (checkFunctionsReady()) {
    getStartedBtn.disabled = false;
} else {
    getStartedBtn.disabled = true;
}
