// ============================================
// MAIN APPLICATION LOGIC WITH MOCK DATA
// ============================================

// Load mock data
const mockDataScript = document.createElement('script');
mockDataScript.src = 'js/mockData.js';
document.head.appendChild(mockDataScript);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Wait for mock data to load
    setTimeout(() => {
        const mealsGrid = document.getElementById('mealsGrid');
        if (mealsGrid) {
            loadFeaturedMeals();
        }
    }, 100);
});

// Load featured meals from mock data
async function loadFeaturedMeals() {
    try {
        // Show loading state
        const mealsGrid = document.getElementById('mealsGrid');
        if (!mealsGrid) return;
        
        mealsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading meals...</p>';
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Get meals from mock data
        const meals = await mockAPI.getMeals();
        
        if (meals.length === 0) {
            mealsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No meals available at the moment.</p>';
            return;
        }
        
        // Display first 6 meals
        const featuredMeals = meals.slice(0, 6);
        mealsGrid.innerHTML = featuredMeals.map(meal => createMealCard(meal)).join('');
    } catch (error) {
        console.error('Error loading meals:', error);
        const mealsGrid = document.getElementById('mealsGrid');
        if (mealsGrid) {
            mealsGrid.innerHTML = '<p style="text-align: center; color: var(--error);">Error loading meals. Please try again later.</p>';
        }
    }
}

// Create meal card HTML
function createMealCard(meal) {
    const discount = Math.round(((meal.originalPrice - meal.discountedPrice) / meal.originalPrice) * 100);
    const formattedOriginal = meal.originalPrice.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });
    const formattedDiscounted = meal.discountedPrice.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });
    
    return `
        <div class="meal-card" onclick="viewMealDetails(${meal.id})">
            <div class="meal-image">${meal.imageUrl || '🍽️'}</div>
            <div class="meal-info">
                <div class="meal-title">${meal.name}</div>
                <div class="meal-description">${meal.description}</div>
                <div class="meal-price">
                    ${formattedDiscounted}
                    <span class="meal-original-price">${formattedOriginal}</span>
                    <span class="meal-discount">-${discount}%</span>
                </div>
                <div class="meal-meta">
                    <span class="meal-vendor">${meal.vendor_name}</span>
                    ${meal.rating ? `<span class="meal-rating">⭐ ${meal.rating.toFixed(1)}</span>` : ''}
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: 16px;" onclick="event.stopPropagation(); addToCart(${meal.id})">Add to Cart</button>
            </div>
        </div>
    `;
}

// View meal details
function viewMealDetails(mealId) {
    // In a real app, this would navigate to a meal details page
    console.log('View meal details:', mealId);
    alert('Meal details page would open here. Meal ID: ' + mealId);
}

// Add meal to cart
function addToCart(mealId) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        if (confirm('You need to login to add items to cart. Would you like to login now?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if meal already in cart
    const existingItem = cart.find(item => item.mealId === mealId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ mealId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show success message
    showNotification('Meal added to cart!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

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
`;
document.head.appendChild(style);
