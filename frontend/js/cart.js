const Cart = {
    get() {
        try {
            const cartJson = localStorage.getItem('chopnow_cart');
            return cartJson ? JSON.parse(cartJson) : [];
        } catch (e) {
            console.error("Error reading cart from localStorage", e);
            return [];
        }
    },

    save(cart) {
        try {
            localStorage.setItem('chopnow_cart', JSON.stringify(cart));
        } catch (e) {
            console.error("Error saving cart to localStorage", e);
        }
    },

    addToCart(mealId, quantity = 1) {
        const cart = this.get();
        const existingItem = cart.find(item => item.mealId === mealId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ mealId, quantity });
        }

        this.save(cart);
        alert('Meal added to cart!');
        this.updateCartCount();
    },

    updateCartCount() {
        const cart = this.get();
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        
        // This is a placeholder for where you would update the cart count in the UI
        // For example, you could have a <span id="cart-count"> in your navbar.
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
        console.log(`Cart count: ${count}`);
    }
};

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateCartCount();
});
