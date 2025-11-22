// Dashboard functionality for both Consumer and Vendor

// Protect dashboard pages
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const userType = localStorage.getItem('userType');
    const currentPage = window.location.pathname.split('/').pop();

    // Ensure user is on correct dashboard
    if (userType === 'vendor' && currentPage === 'consumer-dashboard.html') {
        window.location.href = 'vendor-dashboard.html';
        return;
    }
    if (userType === 'consumer' && currentPage === 'vendor-dashboard.html') {
        window.location.href = 'consumer-dashboard.html';
        return;
    }

    // Load user info
    loadUserInfo();

    // Load notifications
    loadNotifications();

    // Initialize based on user type
    if (userType === 'vendor') {
        initVendorDashboard();
    } else {
        initConsumerDashboard();
    }
});

// Load user information
function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.name || user.business_name || user.email;
        }
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const unreadCount = await API.Notifications.getUnreadCount();
        const badge = document.getElementById('notificationBadge');
        if (badge && unreadCount.count > 0) {
            badge.textContent = unreadCount.count;
            badge.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// ============================================
// CONSUMER DASHBOARD
// ============================================

async function initConsumerDashboard() {
    await loadAvailableMeals();
    await loadConsumerOrders();
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchMeals);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchMeals();
            }
        });
    }
}

async function loadAvailableMeals(filters = {}) {
    try {
        const meals = await API.Meals.getAll(filters);
        displayMeals(meals);
    } catch (error) {
        console.error('Error loading meals:', error);
        showError('Failed to load meals');
    }
}

function displayMeals(meals) {
    const container = document.getElementById('mealsContainer');
    if (!container) return;

    if (meals.length === 0) {
        container.innerHTML = '<p class="text-center">No meals available at the moment.</p>';
        return;
    }

    container.innerHTML = meals.map(meal => `
        <div class="meal-card">
            <img src="${meal.image_url || 'images/default-meal.jpg'}" alt="${meal.name}" class="meal-image">
            <div class="meal-info">
                <h3>${meal.name}</h3>
                <p class="vendor-name">${meal.vendor_name}</p>
                <p class="meal-description">${meal.description || ''}</p>
                <div class="meal-details">
                    <span class="original-price">₦${meal.original_price}</span>
                    <span class="discounted-price">₦${meal.discounted_price}</span>
                    <span class="discount-badge">${Math.round(((meal.original_price - meal.discounted_price) / meal.original_price) * 100)}% OFF</span>
                </div>
                <p class="quantity-available">Available: ${meal.quantity_available}</p>
                <button class="btn btn-primary" onclick="orderMeal(${meal.id}, '${meal.name}', ${meal.discounted_price})">
                    Order Now
                </button>
            </div>
        </div>
    `).join('');
}

async function searchMeals() {
    const searchInput = document.getElementById('searchInput');
    const cuisineFilter = document.getElementById('cuisineFilter');
    const maxPriceFilter = document.getElementById('maxPriceFilter');

    const filters = {};
    if (searchInput && searchInput.value) {
        filters.search = searchInput.value;
    }
    if (cuisineFilter && cuisineFilter.value) {
        filters.cuisine = cuisineFilter.value;
    }
    if (maxPriceFilter && maxPriceFilter.value) {
        filters.maxPrice = maxPriceFilter.value;
    }

    await loadAvailableMeals(filters);
}

async function orderMeal(mealId, mealName, price) {
    const quantity = prompt(`How many portions of ${mealName} would you like?`, '1');
    if (!quantity || quantity <= 0) return;

    const paymentMethod = confirm('Pay with Mobile Money? (Cancel for Card Payment)') ? 'mobile_money' : 'card';

    try {
        const order = await API.Orders.create({
            mealId: mealId,
            quantity: parseInt(quantity),
            paymentMethod: paymentMethod
        });

        alert(`Order placed successfully! Order ID: ${order.orderId}`);
        await loadConsumerOrders();
        await loadAvailableMeals();
    } catch (error) {
        alert('Failed to place order: ' + error.message);
    }
}

async function loadConsumerOrders() {
    try {
        const orders = await API.Orders.getConsumerOrders();
        displayConsumerOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayConsumerOrders(orders) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p>No orders yet.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <p><strong>Meal:</strong> ${order.meal_name}</p>
            <p><strong>Vendor:</strong> ${order.vendor_name}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Total:</strong> ₦${order.total_amount}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <div class="order-actions">
                ${order.status === 'pending' ? `
                    <button class="btn btn-danger btn-sm" onclick="cancelOrder(${order.id})">Cancel Order</button>
                ` : ''}
                ${order.status === 'completed' ? `
                    <a href="review.html?meal_id=${order.meal_id}&order_id=${order.id}" class="btn btn-secondary btn-sm">Leave a Review</a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        await API.Orders.cancel(orderId);
        alert('Order cancelled successfully');
        await loadConsumerOrders();
        await loadAvailableMeals();
    } catch (error) {
        alert('Failed to cancel order: ' + error.message);
    }
}

// ============================================
// VENDOR DASHBOARD
// ============================================

async function initVendorDashboard() {
    await loadVendorMeals();
    await loadVendorOrders();
    connectWebSocket();
    
    // Add meal form
    const addMealForm = document.getElementById('addMealForm');
    if (addMealForm) {
        addMealForm.addEventListener('submit', handleAddMeal);
    }
}

function connectWebSocket() {
    const user = getCurrentUser();
    if (!user || !user.userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('[WS] Connected to server.');
        // Register the client with their userId
        ws.send(JSON.stringify({ type: 'register', userId: user.userId }));
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_order') {
                showToast(data.message);
                loadVendorOrders(); // Refresh the order list
            }
        } catch (e) {
            console.error('[WS] Error processing message:', e);
        }
    };

    ws.onclose = () => {
        console.log('[WS] Disconnected from server. Reconnecting in 5s...');
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect
    };

    ws.onerror = (error) => {
        console.error('[WS] WebSocket error:', error);
    };
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000); // Hide after 5 seconds
    }
}

async function loadVendorMeals() {
    try {
        const meals = await API.Meals.getVendorMeals();
        displayVendorMeals(meals);
    } catch (error) {
        console.error('Error loading vendor meals:', error);
    }
}

function displayVendorMeals(meals) {
    const container = document.getElementById('vendorMealsContainer');
    if (!container) return;

    if (meals.length === 0) {
        container.innerHTML = '<p>No meals listed yet. Add your first meal!</p>';
        return;
    }

    container.innerHTML = meals.map(meal => `
        <div class="meal-card">
            <img src="${meal.image_url || 'images/default-meal.jpg'}" alt="${meal.name}">
            <div class="meal-info">
                <h3>${meal.name}</h3>
                <p>${meal.description || ''}</p>
                <p><strong>Price:</strong> ₦${meal.discounted_price} <span class="text-muted">(was ₦${meal.original_price})</span></p>
                <p><strong>Available:</strong> ${meal.quantity_available}</p>
                <p><strong>Total Orders:</strong> ${meal.total_orders || 0}</p>
                <p><strong>Status:</strong> ${meal.is_available ? 'Available' : 'Unavailable'}</p>
                <button class="btn btn-sm btn-warning" onclick="toggleMealAvailability(${meal.id}, ${meal.is_available})">
                    ${meal.is_available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMeal(${meal.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleAddMeal(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    // Validate discount
    const originalPrice = parseFloat(formData.get('originalPrice'));
    const discountedPrice = parseFloat(formData.get('discountedPrice'));
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    
    if (discount < 20) {
        alert('Discount must be at least 20%');
        return;
    }

    try {
        await API.Meals.create(formData);
        alert('Meal added successfully!');
        e.target.reset();
        await loadVendorMeals();
    } catch (error) {
        alert('Failed to add meal: ' + error.message);
    }
}

async function toggleMealAvailability(mealId, currentStatus) {
    try {
        await API.Meals.update(mealId, { isAvailable: currentStatus ? 0 : 1 });
        await loadVendorMeals();
    } catch (error) {
        alert('Failed to update meal: ' + error.message);
    }
}

async function deleteMeal(mealId) {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
        await API.Meals.delete(mealId);
        alert('Meal deleted successfully');
        await loadVendorMeals();
    } catch (error) {
        alert('Failed to delete meal: ' + error.message);
    }
}

async function loadVendorOrders() {
    try {
        const orders = await API.Orders.getVendorOrders();
        displayVendorOrders(orders);
    } catch (error) {
        console.error('Error loading vendor orders:', error);
    }
}

function displayVendorOrders(orders) {
    const container = document.getElementById('vendorOrdersContainer');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p>No orders yet.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <p><strong>Meal:</strong> ${order.meal_name}</p>
            <p><strong>Customer:</strong> ${order.consumer_name}</p>
            <p><strong>Phone:</strong> ${order.consumer_phone || 'N/A'}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Total:</strong> ₦${order.total_amount}</p>
            <p><strong>Payment:</strong> ${order.payment_method}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <div class="order-actions">
                ${order.status === 'pending' ? `
                    <button class="btn btn-success btn-sm" onclick="updateOrderStatus(${order.id}, 'accepted')">Accept</button>
                    <button class="btn btn-danger btn-sm" onclick="updateOrderStatus(${order.id}, 'cancelled')">Reject</button>
                ` : ''}
                ${order.status === 'accepted' ? `
                    <button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${order.id}, 'preparing')">Start Preparing</button>
                ` : ''}
                ${order.status === 'preparing' ? `
                    <button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${order.id}, 'ready')">Mark Ready</button>
                ` : ''}
                ${order.status === 'ready' ? `
                    <button class="btn btn-success btn-sm" onclick="updateOrderStatus(${order.id}, 'completed')">Mark Completed</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function updateOrderStatus(orderId, status) {
    try {
        await API.Orders.updateStatus(orderId, status);
        alert('Order status updated successfully');
        await loadVendorOrders();
    } catch (error) {
        alert('Failed to update order status: ' + error.message);
    }
}

// Utility functions
function showError(message) {
    alert(message);
}
