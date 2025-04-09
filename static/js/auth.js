document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the register page
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Functions for registration
    async function handleRegister(event) {
        event.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Basic validation
        if (!email || !username || !password) {
            showError('Please fill in all required fields');
            return;
        }
        
        // Email validation
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        // Username validation
        if (username.length < 3 || username.length > 20) {
            showError('Username must be between 3 and 20 characters');
            return;
        }
        
        // Password validation
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        // Confirm passwords match
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        // Show loading state
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Redirect to garden page on successful registration
                window.location.href = '/garden';
            } else {
                showError(data.message || 'Registration failed');
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('An error occurred during registration. Please try again.');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    }
    
    // Functions for login
    async function handleLogin(event) {
        event.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Redirect to garden page on successful login
                window.location.href = '/garden';
            } else {
                showError(data.message || 'Invalid email or password');
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred during login. Please try again.');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    }
    
    // Helper functions
    function showError(message) {
        const errorAlert = document.getElementById('auth-error');
        if (errorAlert) {
            errorAlert.textContent = message;
            errorAlert.classList.remove('d-none');
            
            // Scroll to the error message
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // If no error div exists, create one
            const form = document.querySelector('form');
            if (form) {
                const alert = document.createElement('div');
                alert.id = 'auth-error';
                alert.className = 'alert alert-danger mt-3';
                alert.textContent = message;
                form.prepend(alert);
            } else {
                // Fallback to alert if no form found
                alert(message);
            }
        }
    }
    
    function isValidEmail(email) {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
