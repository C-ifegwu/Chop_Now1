// ChopNow Frontend JavaScript
// Enhanced with consistent functionality and modern features

document.addEventListener('DOMContentLoaded', () => {
    console.log('ChopNow frontend script loaded!');
    
    // Initialize the app
    window.chopNowApp = {
        // Configuration
        config: {
            apiBaseUrl: '/api',
            version: '1.0.0'
        },
        
        // Utility functions
        utils: {
            // Format currency
            formatCurrency: (amount) => {
                return `₦${parseFloat(amount).toLocaleString()}`;
            },
            
            // Format date
            formatDate: (dateString) => {
                return new Date(dateString).toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            },
            
            // Show loading spinner
            showLoading: (element) => {
                if (element) {
                    element.innerHTML = '<div class="spinner" style="margin: 0 auto;"></div>';
                }
            },
            
            // Hide loading spinner
            hideLoading: (element) => {
                if (element) {
                    element.innerHTML = '';
                }
            },
            
            // Debounce function
            debounce: (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
        },
        
        // API helper functions
        makeRequest: async (endpoint, options = {}) => {
            const token = localStorage.getItem('token');
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            };
            
            const finalOptions = { ...defaultOptions, ...options };
            
            try {
                const response = await fetch(endpoint, finalOptions);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }
                
                return data;
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        },
        
        // Notification system
        showNotification: (message, type = 'info', duration = 5000) => {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => notification.remove());
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: var(--space-6);
                right: var(--space-6);
                background: var(--white);
                border: 2px solid var(--${type === 'success' ? 'primary' : type === 'error' ? 'error' : 'gray-300'});
                border-radius: var(--radius-lg);
                padding: var(--space-4) var(--space-6);
                box-shadow: var(--shadow-xl);
                z-index: 9999;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
                display: flex;
                align-items: center;
                gap: var(--space-3);
            `;
            
            const icon = type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-circle' : 
                        'fa-info-circle';
            
            notification.innerHTML = `
                <i class="fas ${icon}" style="color: var(--${type === 'success' ? 'primary' : type === 'error' ? 'error' : 'gray-600'}-color); font-size: 1.25rem;"></i>
                <span style="flex: 1; font-weight: 500; color: var(--gray-900);">${message}</span>
                <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--gray-500); cursor: pointer; font-size: 1.25rem; padding: 0;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remove after duration
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        },
        
        // Authentication functions
        auth: {
            isLoggedIn: () => {
                return !!localStorage.getItem('token');
            },
            
            getUserType: () => {
                return localStorage.getItem('userType');
            },
            
            getUserId: () => {
                return localStorage.getItem('userId');
            },
            
            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userType');
                localStorage.removeItem('userId');
                localStorage.removeItem('cartItems');
                window.location.href = 'login.html';
            }
        },
        
        // Navigation functions
        updateNavigation: () => {
            const token = localStorage.getItem('token');
            const userType = localStorage.getItem('userType');
            const authButtons = document.getElementById('authButtons');
            const userMenu = document.getElementById('userMenu');
            
            if (token && userType) {
                // User is logged in
                if (authButtons) authButtons.style.display = 'none';
                if (userMenu) {
                    userMenu.style.display = 'flex';
                    
                    // Update dashboard link based on user type
                    const dashboardLink = userMenu.querySelector('a[href*="dashboard"]');
                    if (dashboardLink) {
                        if (userType === 'vendor') {
                            dashboardLink.href = 'vendor-dashboard.html';
                        } else {
                            dashboardLink.href = 'consumer-dashboard.html';
                        }
                    }
                }
            } else {
                // User is not logged in
                if (authButtons) authButtons.style.display = 'flex';
                if (userMenu) userMenu.style.display = 'none';
            }
            
            // Update cart count
            window.chopNowApp.cart.updateCount();
        },
        
        // Cart functions
        cart: {
            getItems: async () => {
                if (!window.chopNowApp.auth.isLoggedIn()) {
                    // For non-logged in users, use localStorage
                    const items = localStorage.getItem('cartItems');
                    return items ? JSON.parse(items) : [];
                }
                
                try {
                    const response = await window.chopNowApp.makeRequest('/api/cart');
                    return response.items || [];
                } catch (error) {
                    console.error('Failed to fetch cart items:', error);
                    // Fallback to localStorage
                    const items = localStorage.getItem('cartItems');
                    return items ? JSON.parse(items) : [];
                }
            },
            
            addItem: async (meal) => {
                if (!window.chopNowApp.auth.isLoggedIn()) {
                    // For non-logged in users, use localStorage
                    const items = window.chopNowApp.cart.getLocalItems();
                    const existingItem = items.find(item => item.id === meal.id);
                    
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        items.push({ ...meal, quantity: 1 });
                    }
                    
                    localStorage.setItem('cartItems', JSON.stringify(items));
                    window.chopNowApp.cart.updateCount();
                    window.chopNowApp.showNotification('Added to cart successfully!', 'success');
                    return;
                }
                
                try {
                    await window.chopNowApp.makeRequest('/api/cart/add', {
                        method: 'POST',
                        body: JSON.stringify({
                            mealId: meal.id,
                            quantity: 1
                        })
                    });
                    
                    window.chopNowApp.cart.updateCount();
                    window.chopNowApp.showNotification('Added to cart successfully!', 'success');
                } catch (error) {
                    console.error('Failed to add item to cart:', error);
                    window.chopNowApp.showNotification('Failed to add item to cart', 'error');
                }
            },
            
            removeItem: async (mealId) => {
                if (!window.chopNowApp.auth.isLoggedIn()) {
                    const items = window.chopNowApp.cart.getLocalItems();
                    const filteredItems = items.filter(item => item.id !== mealId);
                    localStorage.setItem('cartItems', JSON.stringify(filteredItems));
                    window.chopNowApp.cart.updateCount();
                    return;
                }
                
                try {
                    await window.chopNowApp.makeRequest(`/api/cart/remove/${mealId}`, {
                        method: 'DELETE'
                    });
                    
                    window.chopNowApp.cart.updateCount();
                } catch (error) {
                    console.error('Failed to remove item from cart:', error);
                }
            },
            
            getLocalItems: () => {
                const items = localStorage.getItem('cartItems');
                return items ? JSON.parse(items) : [];
            },
            
            updateCount: async () => {
                let count = 0;
                
                if (window.chopNowApp.auth.isLoggedIn()) {
                    try {
                        const items = await window.chopNowApp.cart.getItems();
                        count = items.reduce((total, item) => total + item.quantity, 0);
                    } catch (error) {
                        console.error('Failed to get cart count:', error);
                    }
                } else {
                    const items = window.chopNowApp.cart.getLocalItems();
                    count = items.reduce((total, item) => total + item.quantity, 0);
                }
                
                const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
                cartCountElements.forEach(element => {
                    if (element) {
                        element.textContent = count;
                    }
                });
            },
            
            clear: async () => {
                if (!window.chopNowApp.auth.isLoggedIn()) {
                    localStorage.removeItem('cartItems');
                    window.chopNowApp.cart.updateCount();
                    return;
                }
                
                try {
                    await window.chopNowApp.makeRequest('/api/cart/clear', {
                        method: 'DELETE'
                    });
                    
                    window.chopNowApp.cart.updateCount();
                } catch (error) {
                    console.error('Failed to clear cart:', error);
                }
            }
        }
    };
    
    // Initialize navigation
    window.chopNowApp.updateNavigation();
    
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('show');
            }
        });
    }
    
    // Global logout function
    window.logout = () => {
        if (confirm('Are you sure you want to logout?')) {
            window.chopNowApp.auth.logout();
        }
    };
    
    // Global add to cart function
    window.addToCart = (mealId) => {
        // This is a simplified version - in production, you'd fetch meal details from API
        const meal = {
            id: mealId,
            name: 'Sample Meal',
            discounted_price: 1000,
            original_price: 1500,
            vendor_name: 'Sample Vendor'
        };
        
        window.chopNowApp.cart.addItem(meal);
    };
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Form validation helpers
    window.validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    window.validatePassword = (password) => {
        return password.length >= 6;
    };
    
    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.category-card, .meal-card, .restaurant-card, .feature-card, .stat-card').forEach(el => {
        observer.observe(el);
    });
    
    // Search functionality
    window.searchMeals = () => {
        const searchInput = document.getElementById('searchInput') || document.getElementById('locationSearch');
        if (searchInput) {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `meals.html?search=${encodeURIComponent(searchTerm)}`;
            } else {
                window.location.href = 'meals.html';
            }
        }
    };
    
    // Add CSS animations
    const style = document.createElement('style');
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
        
        .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('ChopNow app initialized successfully!');
});