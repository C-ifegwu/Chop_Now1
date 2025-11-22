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
        container.innerHTML = '<tr><td colspan="7" class="text-center">No orders yet.</td></tr>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.meal_name}</td>
            <td>${order.vendor_name}</td>
            <td>₦${order.total_amount}</td>
            <td><span class="badge bg-info text-dark">${order.status}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                ${order.status === 'pending' ? `
                    <button class="btn btn-danger btn-sm" onclick="cancelOrder(${order.id})">Cancel</button>
                ` : ''}
                ${order.status === 'completed' ? `
                    <a href="review.html?meal_id=${order.meal_id}&order_id=${order.id}" class="btn btn-secondary btn-sm">Review</a>
                ` : ''}
            </td>
        </tr>
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
    const toastEl = document.getElementById('toast');
    const toastBody = toastEl.querySelector('.toast-body');
    if (toastBody) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
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
        container.innerHTML = '<div class="col-12 text-center"><p>No meals listed yet. Add your first meal!</p></div>';
        return;
    }

    container.innerHTML = meals.map(meal => `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <img src="${meal.image_url || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${meal.name}">
                <div class="card-body">
                    <h5 class="card-title">${meal.name}</h5>
                    <p class="card-text small text-muted">${meal.is_available ? 'Available' : 'Unavailable'}</p>
                    <p class="card-text"><strong>Price:</strong> ₦${meal.discounted_price}</p>
                    <p class="card-text"><strong>Available:</strong> ${meal.quantity_available}</p>
                </div>
                <div class="card-footer bg-transparent border-0 p-3">
                    <button class="btn btn-sm btn-outline-secondary" onclick="toggleMealAvailability(${meal.id}, ${meal.is_available})">
                        ${meal.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMeal(${meal.id})">Delete</button>
                </div>
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
        container.innerHTML = '<tr><td colspan="7" class="text-center">No orders yet.</td></tr>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.meal_name}</td>
            <td>${order.consumer_name || 'N/A'}</td>
            <td>₦${order.total_amount}</td>
            <td><span class="badge bg-info text-dark">${order.status}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'accepted')">Accept</button>
                        <button class="btn btn-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')">Reject</button>
                    ` : ''}
                    ${order.status === 'accepted' ? `<button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'preparing')">Prepare</button>` : ''}
                    ${order.status === 'preparing' ? `<button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'ready')">Ready</button>` : ''}
                    ${order.status === 'ready' ? `<button class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'completed')">Complete</button>` : ''}
                </div>
            </td>
        </tr>
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
