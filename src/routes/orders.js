const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeConsumer, authorizeVendor } = require('../middleware/auth');
const { sendNotificationToVendor } = require('../services/websocket');

// Create a new order (Consumer only)
router.post('/', authenticateToken, authorizeConsumer, async (req, res) => {
    try {
        const consumerId = req.user.userId;
        const { vendor_id, items } = req.body; // items is an array of { meal_id, quantity }

        if (!vendor_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Invalid order data' });
        }

        // Calculate total amount and verify meals
        let totalAmount = 0;
        const mealsToUpdate = [];
        for (const item of items) {
            const mealResult = await db.query('SELECT * FROM meals WHERE id = $1 AND vendor_id = $2 AND is_available = TRUE AND quantity_available >= $3', 
                [item.meal_id, vendor_id, item.quantity]);
            const meal = mealResult.rows[0];
            
            if (!meal) {
                return res.status(400).json({ message: `Meal with ID ${item.meal_id} is not available or quantity is insufficient.` });
            }
            totalAmount += meal.discounted_price * item.quantity;
            mealsToUpdate.push({ ...item, price: meal.discounted_price });
        }

        // Create the order
        const orderResult = await db.query(
            `INSERT INTO orders (consumer_id, vendor_id, total_amount, status)
             VALUES ($1, $2, $3, 'pending') RETURNING id`,
            [consumerId, vendor_id, totalAmount]
        );
        const orderId = orderResult.rows[0].id;

        // Create order items and update meal quantities
        for (const item of mealsToUpdate) {
            await db.query('INSERT INTO order_items (order_id, meal_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.meal_id, item.quantity, item.price]);
            
            await db.query('UPDATE meals SET quantity_available = quantity_available - $1 WHERE id = $2',
                [item.quantity, item.meal_id]);
        }

        // Send real-time notification to vendor
        sendNotificationToVendor(vendor_id, {
            type: 'new_order',
            message: `You have a new order! Order #${orderId}`,
            orderId: orderId
        });

        res.status(201).json({ 
            message: 'Order created successfully', 
            orderId: orderId 
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
});

// Get orders for consumer
router.get('/consumer', authenticateToken, authorizeConsumer, async (req, res) => {
    try {
        const ordersResult = await db.query(
            `SELECT o.*, u.business_name as vendor_name
             FROM orders o
             JOIN users u ON o.vendor_id = u.id
             WHERE o.consumer_id = $1
             ORDER BY o.created_at DESC`,
            [req.user.userId]
        );
        const orders = ordersResult.rows;

        for (const order of orders) {
            const itemsResult = await db.query(
                `SELECT oi.*, m.name as meal_name, m.image_url
                 FROM order_items oi
                 JOIN meals m ON oi.meal_id = m.id
                 WHERE oi.order_id = $1`,
                [order.id]
            );
            order.items = itemsResult.rows;
        }

        res.json(orders);
    } catch (error) {
        console.error('Get consumer orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// Get orders for vendor
router.get('/vendor', authenticateToken, authorizeVendor, async (req, res) => {
    try {
        const ordersResult = await db.query(
            `SELECT o.*, u.name as consumer_name, u.phone as consumer_phone
             FROM orders o
             JOIN users u ON o.consumer_id = u.id
             WHERE o.vendor_id = $1
             ORDER BY o.created_at DESC`,
            [req.user.userId]
        );
        const orders = ordersResult.rows;

        for (const order of orders) {
            const itemsResult = await db.query(
                `SELECT oi.*, m.name as meal_name, m.image_url
                 FROM order_items oi
                 JOIN meals m ON oi.meal_id = m.id
                 WHERE oi.order_id = $1`,
                [order.id]
            );
            order.items = itemsResult.rows;
        }

        res.json(orders);
    } catch (error) {
        console.error('Get vendor orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: aerror.message });
    }
});

// Update order status (Vendor only)
router.put('/:id/status', authenticateToken, authorizeVendor, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Verify order belongs to vendor
        const orderResult = await db.query(
            `SELECT * FROM orders WHERE id = $1 AND vendor_id = $2`,
            [orderId, req.user.userId]
        );
        const order = orderResult.rows[0];

        if (!order) {
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }

        await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, orderId]);

        // Get meal and consumer info for notification
        // Note: original query joined on o.meal_id but orders table doesn't have meal_id directly.
        // Assuming order_items will be used to get meal details if needed for notification.
        const orderDetailsResult = await db.query(
            `SELECT o.consumer_id, m.name as meal_name
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN meals m ON oi.meal_id = m.id
             WHERE o.id = $1 LIMIT 1`, // LIMIT 1 as we just need one meal's name for notification example
            [orderId]
        );
        const orderDetails = orderDetailsResult.rows[0];

        // Notify consumer of status change
        // await notifyConsumerOrderStatus(orderDetails.consumer_id, orderId, status, orderDetails.meal_name);

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
});

// Cancel order (Consumer only, before vendor accepts)
router.delete('/:id', authenticateToken, authorizeConsumer, async (req, res) => {
    try {
        const orderId = req.params.id;

        const orderResult = await db.query('SELECT * FROM orders WHERE id = $1 AND consumer_id = $2', [orderId, req.user.userId]);
        const order = orderResult.rows[0];
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order can only be cancelled if status is pending' });
        }

        const orderItemsResult = await db.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
        const orderItems = orderItemsResult.rows;

        // Restore meal quantity
        for (const item of orderItems) {
            await db.query(
                'UPDATE meals SET quantity_available = quantity_available + $1 WHERE id = $2',
                [item.quantity, item.meal_id]
            );
        }

        await db.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
        await db.query('DELETE FROM orders WHERE id = $1', [orderId]);

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
});

module.exports = router;

