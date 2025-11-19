const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { notifyVendorNewOrder, notifyConsumerOrderStatus } = require('../services/notification.service');

// Create new order (Consumer only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const consumerId = req.user.userId;
        const { mealId, quantity, paymentMethod } = req.body;

        if (req.user.userType !== 'consumer') {
            return res.status(403).json({ message: 'Only consumers can place orders' });
        }

        // Get meal details
        const meal = await db.get('SELECT * FROM meals WHERE id = ? AND is_available = 1', [mealId]);
        if (!meal) {
            return res.status(404).json({ message: 'Meal not available' });
        }

        if (meal.quantity_available < quantity) {
            return res.status(400).json({ message: 'Insufficient quantity available' });
        }

        const totalAmount = meal.discounted_price * quantity;

        // Create order
        const result = await db.run(
            `INSERT INTO orders (consumer_id, meal_id, quantity, total_amount, payment_method, status, created_at)
             VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
            [consumerId, mealId, quantity, totalAmount, paymentMethod]
        );

        // Update meal quantity
        await db.run(
            'UPDATE meals SET quantity_available = quantity_available - ? WHERE id = ?',
            [quantity, mealId]
        );

        // Notify vendor of new order
        await notifyVendorNewOrder(meal.vendor_id, result.lastID, meal.name);

        res.status(201).json({
            message: 'Order placed successfully',
            orderId: result.lastID
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
});

// Get orders for consumer
router.get('/consumer', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'consumer') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const orders = await db.all(
            `SELECT o.*, m.name as meal_name, m.image_url, u.business_name as vendor_name
             FROM orders o
             JOIN meals m ON o.meal_id = m.id
             JOIN users u ON m.vendor_id = u.id
             WHERE o.consumer_id = ?
             ORDER BY o.created_at DESC`,
            [req.user.userId]
        );

        res.json(orders);
    } catch (error) {
        console.error('Get consumer orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// Get orders for vendor
router.get('/vendor', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'vendor') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const orders = await db.all(
            `SELECT o.*, m.name as meal_name, u.name as consumer_name, u.phone as consumer_phone
             FROM orders o
             JOIN meals m ON o.meal_id = m.id
             JOIN users u ON o.consumer_id = u.id
             WHERE m.vendor_id = ?
             ORDER BY o.created_at DESC`,
            [req.user.userId]
        );

        res.json(orders);
    } catch (error) {
        console.error('Get vendor orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// Update order status (Vendor only)
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'vendor') {
            return res.status(403).json({ message: 'Only vendors can update order status' });
        }

        const { status } = req.body;
        const orderId = req.params.id;

        // Verify order belongs to vendor
        const order = await db.get(
            `SELECT o.* FROM orders o
             JOIN meals m ON o.meal_id = m.id
             WHERE o.id = ? AND m.vendor_id = ?`,
            [orderId, req.user.userId]
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }

        await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        // Get meal and consumer info for notification
        const orderDetails = await db.get(
            `SELECT o.consumer_id, m.name as meal_name
             FROM orders o
             JOIN meals m ON o.meal_id = m.id
             WHERE o.id = ?`,
            [orderId]
        );

        // Notify consumer of status change
        await notifyConsumerOrderStatus(orderDetails.consumer_id, orderId, status, orderDetails.meal_name);

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
});

// Cancel order (Consumer only, before vendor accepts)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'consumer') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const orderId = req.params.id;

        const order = await db.get('SELECT * FROM orders WHERE id = ? AND consumer_id = ?', [orderId, req.user.userId]);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order can only be cancelled if status is pending' });
        }

        // Restore meal quantity
        await db.run(
            'UPDATE meals SET quantity_available = quantity_available + ? WHERE id = ?',
            [order.quantity, order.meal_id]
        );

        await db.run('DELETE FROM orders WHERE id = ?', [orderId]);

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
});

module.exports = router;

