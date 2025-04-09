// Enhanced authentication with Supabase
document.addEventListener('DOMContentLoaded', function() {
    // Setup auth forms if they exist
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const profileForm = document.getElementById('profile-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Setup login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup register form
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Setup reset password form
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
    
    // Setup profile form
    if (profileForm) {
        profileForm.addEventListener('submit', handleUpdateProfile);
    }
    
    // Setup logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Show loader when submitting forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
                submitBtn.disabled = true;
            }
        });
    });
    
    // Authentication handlers
    async function handleLogin(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            showAuthError('Email and password are required');
            resetSubmitButton(this);
            return;
        }
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Redirect to garden page
                window.location.href = '/garden';
            } else {
                showAuthError(data.message || 'Login failed');
                resetSubmitButton(this);
            }
        } catch (error) {
            console.error('Login error:', error);
            showAuthError('An error occurred. Please try again later.');
            resetSubmitButton(this);
        }
    }
    
    async function handleRegister(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        const email = emailInput.value.trim();
        const username = usernameInput ? usernameInput.value.trim() : email.split('@')[0];
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : password;
        
        if (!email || !password) {
            showAuthError('Email and password are required');
            resetSubmitButton(this);
            return;
        }
        
        if (password !== confirmPassword) {
            showAuthError('Passwords do not match');
            resetSubmitButton(this);
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, username })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Redirect to garden page
                window.location.href = '/garden';
            } else {
                showAuthError(data.message || 'Registration failed');
                resetSubmitButton(this);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAuthError('An error occurred. Please try again later.');
            resetSubmitButton(this);
        }
    }
    
    async function handleResetPassword(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        
        if (!email) {
            showAuthError('Email is required');
            resetSubmitButton(this);
            return;
        }
        
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAuthSuccess('Password reset email sent. Please check your inbox.');
                resetSubmitButton(this);
                emailInput.value = '';
            } else {
                showAuthError(data.message || 'Failed to send reset email');
                resetSubmitButton(this);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            showAuthError('An error occurred. Please try again later.');
            resetSubmitButton(this);
        }
    }
    
    async function handleUpdateProfile(event) {
        event.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const username = usernameInput ? usernameInput.value.trim() : null;
        
        if (!username) {
            showAuthError('Username is required');
            resetSubmitButton(this);
            return;
        }
        
        try {
            const response = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAuthSuccess('Profile updated successfully');
                resetSubmitButton(this);
            } else {
                showAuthError(data.message || 'Failed to update profile');
                resetSubmitButton(this);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showAuthError('An error occurred. Please try again later.');
            resetSubmitButton(this);
        }
    }
    
    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            });
            
            // Redirect to login page
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect to login page even if there's an error
            window.location.href = '/login';
        }
    }
    
    // Helper functions
    function showAuthError(message) {
        const errorElement = document.getElementById('auth-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
            
            // Hide after 5 seconds
            setTimeout(() => {
                errorElement.classList.add('d-none');
            }, 5000);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
    
    function showAuthSuccess(message) {
        const successElement = document.getElementById('auth-success');
        if (successElement) {
            successElement.textContent = message;
            successElement.classList.remove('d-none');
            
            // Hide after 5 seconds
            setTimeout(() => {
                successElement.classList.add('d-none');
            }, 5000);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
    
    function resetSubmitButton(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.getAttribute('data-original-text') || 'Submit';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Set original button text for all submit buttons
    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.setAttribute('data-original-text', button.innerHTML);
    });
});