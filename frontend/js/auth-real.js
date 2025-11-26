// Authentication Handler with Real API

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Get current user info
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Login function
async function login(email, password) {
    try {
        const result = await API.Auth.login(email, password);
        
        // Store auth data
        localStorage.setItem('token', result.token);
        localStorage.setItem('userType', result.userType);
        localStorage.setItem('userId', result.userId);
        
        // Get and store user profile
        const profile = await API.Auth.getProfile();
        localStorage.setItem('user', JSON.stringify(profile));
        
        // Redirect based on user type
        if (result.userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        } else {
            window.location.href = 'consumer-dashboard.html';
        }
        
        return result;
    } catch (error) {
        alert('Login failed: ' + error.message);
        throw error;
    }
}

// Register function
async function register(userData) {
    try {
        const result = await API.Auth.register(userData);
        
        // Store auth data
        localStorage.setItem('token', result.token);
        localStorage.setItem('userType', result.userType);
        localStorage.setItem('userId', result.userId);
        
        // Get and store user profile
        const profile = await API.Auth.getProfile();
        localStorage.setItem('user', JSON.stringify(profile));
        
        // Redirect based on user type
        if (result.userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        } else {
            window.location.href = 'consumer-dashboard.html';
        }
        
        return result;
    } catch (error) {
        alert('Registration failed: ' + error.message);
        throw error;
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    const currentPage = window.location.pathname.split('/').pop();
    if (isAuthenticated() && (currentPage === 'login.html' || currentPage === 'register.html')) {
        const userType = localStorage.getItem('userType');
        if (userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        } else {
            window.location.href = 'consumer-dashboard.html';
        }
        return;
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                await login(email, password);
            } catch (error) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            const userData = {
                email: document.getElementById('email').value,
                password: password,
                userType: document.getElementById('userType').value,
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value
            };

            const businessNameField = document.getElementById('businessName');
            if (userData.userType === 'vendor' && businessNameField) {
                userData.businessName = businessNameField.value;
            }

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            try {
                await register(userData);
            } catch (error) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Logout buttons
    const logoutBtns = document.querySelectorAll('.logout-btn, #logoutBtn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
});
