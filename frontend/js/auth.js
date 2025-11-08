// ============================================
// AUTHENTICATION WITH MOCK DATA
// ============================================

// Load mock data
const mockDataScript = document.createElement('script');
mockDataScript.src = 'js/mockData.js';
document.head.appendChild(mockDataScript);

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (isAuthenticated()) {
        const userType = localStorage.getItem('userType');
        if (userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        } else {
            window.location.href = 'consumer-dashboard.html';
        }
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Show loading state
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

            const businessName = document.getElementById('businessName').value;
            if (userData.userType === 'vendor' && businessName) {
                userData.businessName = businessName;
            }

            // Show loading state
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
});

// Login function with mock data
async function login(email, password) {
    try {
        // Wait for mock data to be available
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await mockAPI.login(email, password);
        
        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('userType', result.userType);
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Show success message
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (result.userType === 'vendor') {
                    window.location.href = 'vendor-dashboard.html';
                } else {
                    window.location.href = 'consumer-dashboard.html';
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please check your credentials.', 'error');
        throw error;
    }
}

// Register function with mock data
async function register(userData) {
    try {
        // Wait for mock data to be available
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await mockAPI.register(userData);
        
        if (result.success) {
            // Auto-login the user after registration
            localStorage.setItem('token', result.token);
            localStorage.setItem('userType', result.userType);
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            showNotification('Registration successful! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                if (result.userType === 'vendor') {
                    window.location.href = 'vendor-dashboard.html';
                } else {
                    window.location.href = 'consumer-dashboard.html';
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.message || 'Registration failed. Please try again.';
        showNotification(errorMessage, 'error');
        throw error;
    }
}

// Check if user is logged in
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Get current user
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
    localStorage.removeItem('cart');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations if not already added
if (!document.getElementById('auth-animations')) {
    const style = document.createElement('style');
    style.id = 'auth-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
