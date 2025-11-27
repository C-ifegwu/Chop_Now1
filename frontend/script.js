document.addEventListener('DOMContentLoaded', () => {
    console.log('ChopNow frontend script loaded!');

    // --- Shared Navigation and Authentication Logic ---
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const authLinks = document.getElementById('auth-links');
    const dashboardLink = document.getElementById('dashboard-link');
    const logoutButton = document.getElementById('logout-button');
    const cartLink = document.getElementById('cart-link');
    const cartCountSpan = document.getElementById('cart-count');

    if (token) {
        if (authLinks) authLinks.style.display = 'none'; // Hide login/register
        if (logoutButton) logoutButton.style.display = 'inline'; // Show logout

        if (dashboardLink) {
            if (userType === 'vendor') {
                dashboardLink.href = 'vendor-dashboard.html';
            } else { // consumer
                dashboardLink.href = 'consumer-dashboard.html';
                if (cartLink) cartLink.style.display = 'inline'; // Show cart for consumers
            }
            dashboardLink.style.display = 'inline'; // Show dashboard
        }
    } else {
        if (authLinks) authLinks.style.display = 'block'; // Show login/register
        if (logoutButton) logoutButton.style.display = 'none'; // Hide logout
        if (dashboardLink) dashboardLink.style.display = 'none'; // Hide dashboard
        if (cartLink) cartLink.style.display = 'none'; // Hide cart for guests
    }

    // --- Logout Functionality ---
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
        });
    }

    // --- Update Cart Count ---
    function updateCartCount() {
        if (cartCountSpan) {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            cartCountSpan.textContent = cartItems.length;
        }
    }
    updateCartCount(); // Call once on load

    // Example of a simple interaction from index.html (if this script is used there)
    const browseButton = document.querySelector('#hero button');
    if (browseButton) {
        browseButton.addEventListener('click', () => {
            // This is handled by a direct link now in index.html
            // window.location.href = 'meals.html';
        });
    }
});