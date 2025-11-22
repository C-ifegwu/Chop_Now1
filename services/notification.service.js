const db = require('../config/database');

/**
 * Create a notification for a user
 */
async function createNotification(userId, type, title, message) {
    try {
        await db.run(
            `INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
             VALUES (?, ?, ?, ?, 0, datetime('now'))`,
            [userId, type, title, message]
        );
        console.log(`Notification created for user ${userId}: ${title}`);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

/**
 * Notify vendor of new order
 */
async function notifyVendorNewOrder(vendorId, orderId, mealName) {
    await createNotification(
        vendorId,
        'new_order',
        'New Order Received!',
        `You have a new order for ${mealName}. Order #${orderId}`
    );
}

/**
 * Notify consumer of order status change
 */
async function notifyConsumerOrderStatus(consumerId, orderId, status, mealName) {
    const statusMessages = {
        'accepted': `Your order for ${mealName} has been accepted!`,
        'preparing': `Your order for ${mealName} is being prepared.`,
        'ready': `Your order for ${mealName} is ready for pickup!`,
        'completed': `Your order for ${mealName} has been completed. Thank you!`,
        'cancelled': `Your order for ${mealName} has been cancelled.`
    };

    await createNotification(
        consumerId,
        'order_status',
        'Order Status Update',
        statusMessages[status] || `Order #${orderId} status: ${status}`
    );
}

/**
 * Notify consumer of new meal from favorite vendor
 */
async function notifyConsumerNewMeal(consumerId, vendorName, mealName) {
    await createNotification(
        consumerId,
        'new_meal',
        'New Meal Available!',
        `${vendorName} has listed a new meal: ${mealName}`
    );
}

module.exports = {
    createNotification,
    notifyVendorNewOrder,
    notifyConsumerOrderStatus,
    notifyConsumerNewMeal
};
