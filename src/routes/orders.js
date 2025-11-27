const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeConsumer, authorizeVendor } = require('../middleware/auth');
const { sendNotificationToVendor } = require('../services/websocket');

// Create a new order (Consumer only)
router.post('/', authenticateToken, authorizeConsumer, async (req, res) => {
    let transaction;
    try {
        transaction = await db.beginTransaction();
        const consumerId = req.user.userId;
        const { vendor_id, items } = req.body; // items is an array of { meal_id, quantity }

        if (!vendor_id || !items || !Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Invalid order data' });
        }

        // Calculate total amount and verify meals
        let totalAmount = 0;
        const mealsToUpdate = [];
        for (const item of items) {
            const meal = await db.get('SELECT * FROM meals WHERE id = ? AND vendor_id = ? AND is_available = 1 AND quantity_available >= ?', 
                [item.meal_id, vendor_id, item.quantity]);
            
            if (!meal) {
                await transaction.rollback();
                return res.status(400).json({ message: `Meal with ID ${item.meal_id} is not available or quantity is insufficient.` });
            }
            totalAmount += meal.discounted_price * item.quantity;
            mealsToUpdate.push({ ...item, price: meal.discounted_price });
        }

        // Create the order
        const orderResult = await db.run(
            `INSERT INTO orders (consumer_id, vendor_id, total_amount, status)
             VALUES (?, ?, ?, 'pending')`,
            [consumerId, vendor_id, totalAmount]
        );
        const orderId = orderResult.lastID;

        // Create order items and update meal quantities
        for (const item of mealsToUpdate) {
            await db.run('INSERT INTO order_items (order_id, meal_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.meal_id, item.quantity, item.price]);
            
            await db.run('UPDATE meals SET quantity_available = quantity_available - ? WHERE id = ?',
                [item.quantity, item.meal_id]);
        }

        await transaction.commit();

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
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
});

// Get orders for consumer
router.get('/consumer', authenticateToken, authorizeConsumer, async (req, res) => {
    try {
        const orders = await db.all(
            `SELECT o.*, u.business_name as vendor_name
             FROM orders o
             JOIN users u ON o.vendor_id = u.id
             WHERE o.consumer_id = ?
             ORDER BY o.created_at DESC`,
            [req.user.userId]
        );

        for (const order of orders) {
            const items = await db.all(
                `SELECT oi.*, m.name as meal_name, m.image_url
                 FROM order_items oi
                 JOIN meals m ON oi.meal_id = m.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
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
        const ordersResult = await db.all(
            `SELECT o.*, u.name as consumer_name, u.phone as consumer_phone
             FROM orders o
             JOIN users u ON o.consumer_id = u.id
             WHERE o.vendor_id = ?
             ORDER BY o.created_at DESC`,
            [req.user.userId]
        );
        const orders = ordersResult;

        for (const order of orders) {
            const itemsResult = await db.all(
                `SELECT oi.*, m.name as meal_name, m.image_url
                 FROM order_items oi
                 JOIN meals m ON oi.meal_id = m.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = itemsResult;
        }

        res.json(orders);
    } catch (error) {
        console.error('Get vendor orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// Update order status (Vendor only)
router.put('/:id/status', authenticateToken, authorizeVendor, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Verify order belongs to vendor
        const orderData = await db.get(
            `SELECT * FROM orders WHERE id = ? AND vendor_id = ?`,
            [orderId, req.user.userId]
        );

        if (!orderData) {
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }

        await db.run('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?', [status, orderId]);

        // Get meal and consumer info for notification
        // Note: original query joined on o.meal_id but orders table doesn't have meal_id directly.
        // Assuming order_items will be used to get meal details if needed for notification.
        const orderInfo = await db.get(
            `SELECT o.consumer_id, m.name as meal_name
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN meals m ON oi.meal_id = m.id
             WHERE o.id = ? LIMIT 1`, // LIMIT 1 as we just need one meal's name for notification example
            [orderId]
        );

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
    let transaction;
    try {
        transaction = await db.beginTransaction();
        const orderId = req.params.id;

        const order = await db.get('SELECT * FROM orders WHERE id = ? AND consumer_id = ?', [orderId, req.user.userId]);
        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Order can only be cancelled if status is pending' });
        }

        const orderItems = await db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        // Restore meal quantity
        for (const item of orderItems) {
            await db.run(
                'UPDATE meals SET quantity_available = quantity_available + ? WHERE id = ?',
                [item.quantity, item.meal_id]
            );
        }

        await db.run('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        await db.run('DELETE FROM orders WHERE id = ?', [orderId]);

        await transaction.commit();
        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
});

module.exports = router;

