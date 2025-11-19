// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const AuthAPI = {
    async login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true
        });
        return data;
    },
    
    async register(userData) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            skipAuth: true
        });
        return data;
    },
    
    async getProfile() {
        return await apiRequest('/auth/profile');
    }
};

// Meals API
const MealsAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters);
        return await apiRequest(`/meals?${params}`, { skipAuth: true });
    },
    
    async getById(id) {
        return await apiRequest(`/meals/${id}`, { skipAuth: true });
    },
    
    async create(formData) {
        // For FormData, don't set Content-Type header
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/meals`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create meal');
        }
        return data;
    },
    
    async update(id, mealData) {
        return await apiRequest(`/meals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(mealData)
        });
    },
    
    async delete(id) {
        return await apiRequest(`/meals/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getVendorMeals() {
        return await apiRequest('/meals/vendor/my-meals');
    }
};

// Orders API
const OrdersAPI = {
    async create(orderData) {
        return await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },
    
    async getConsumerOrders() {
        return await apiRequest('/orders/consumer');
    },
    
    async getVendorOrders() {
        return await apiRequest('/orders/vendor');
    },
    
    async updateStatus(orderId, status) {
        return await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },
    
    async cancel(orderId) {
        return await apiRequest(`/orders/${orderId}`, {
            method: 'DELETE'
        });
    }
};

// Reviews API
const ReviewsAPI = {
    async create(reviewData) {
        return await apiRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },
    
    async getMealReviews(mealId) {
        return await apiRequest(`/reviews/meal/${mealId}`, { skipAuth: true });
    },
    
    async respondToReview(reviewId, response) {
        return await apiRequest(`/reviews/${reviewId}/respond`, {
            method: 'PUT',
            body: JSON.stringify({ response })
        });
    }
};

// Notifications API
const NotificationsAPI = {
    async getAll() {
        return await apiRequest('/notifications');
    },
    
    async getUnreadCount() {
        return await apiRequest('/notifications/unread-count');
    },
    
    async markAsRead(notificationId) {
        return await apiRequest(`/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    },
    
    async markAllAsRead() {
        return await apiRequest('/notifications/mark-all-read', {
            method: 'PUT'
        });
    },
    
    async delete(notificationId) {
        return await apiRequest(`/notifications/${notificationId}`, {
            method: 'DELETE'
        });
    }
};

// Export APIs
window.API = {
    Auth: AuthAPI,
    Meals: MealsAPI,
    Orders: OrdersAPI,
    Reviews: ReviewsAPI,
    Notifications: NotificationsAPI
};
