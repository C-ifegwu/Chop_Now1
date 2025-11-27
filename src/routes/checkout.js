const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeConsumer } = require('../middleware/auth');

// Create order from cart
router.post('/create-order', authenticateToken, authorizeConsumer, async (req, res) => {
    let transaction;
    try {
        transaction = await db.beginTransaction();
        const userId = req.user.userId;
        const { deliveryAddress, paymentMethod } = req.body;
        
        // Get cart items
        const cartItems = await db.all(`
            SELECT 
                ci.*,
                m.name,
                m.discounted_price,
                m.vendor_id,
                u.business_name as vendor_name
            FROM cart_items ci
            JOIN meals m ON ci.meal_id = m.id
            JOIN users u ON m.vendor_id = u.id
            WHERE ci.user_id = ?
        `, [userId]);
        
        if (cartItems.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        // Group items by vendor
        const ordersByVendor = {};
        cartItems.forEach(item => {
            if (!ordersByVendor[item.vendor_id]) {
                ordersByVendor[item.vendor_id] = {
                    vendorId: item.vendor_id,
                    vendorName: item.vendor_name,
                    items: [],
                    totalAmount: 0
                };
            }
            ordersByVendor[item.vendor_id].items.push(item);
            ordersByVendor[item.vendor_id].totalAmount += item.discounted_price * item.quantity;
        });
        
        const createdOrders = [];
        
        // Create separate orders for each vendor
        for (const vendorOrder of Object.values(ordersByVendor)) {
            // Create order
            const orderResult = await db.run(
                `INSERT INTO orders (consumer_id, vendor_id, total_amount, status, payment_method, payment_status, delivery_address, created_at)
                 VALUES (?, ?, ?, 'pending', ?, 'pending', ?, ?)`,
                [userId, vendorOrder.vendorId, vendorOrder.totalAmount, paymentMethod, deliveryAddress, new Date().toISOString()]
            );
            
            const orderId = orderResult.lastID;
            
            // Create order items
            for (const item of vendorOrder.items) {
                await db.run(
                    'INSERT INTO order_items (order_id, meal_id, quantity, price, created_at) VALUES (?, ?, ?, ?, ?)',
                    [orderId, item.meal_id, item.quantity, item.discounted_price, new Date().toISOString()]
                );
                
                // Update meal quantity
                await db.run(
                    'UPDATE meals SET quantity_available = quantity_available - ? WHERE id = ?',
                    [item.quantity, item.meal_id]
                );
            }
            
            createdOrders.push({
                orderId,
                vendorName: vendorOrder.vendorName,
                totalAmount: vendorOrder.totalAmount,
                itemCount: vendorOrder.items.length
            });
        }
        
        // Clear cart (now inside the transaction for atomicity)
        await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        // In a real app, you would integrate with payment gateway here
        // For now, we'll simulate successful payment
        for (const order of createdOrders) {
            await db.run(
                'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
                ['completed', 'confirmed', order.orderId]
            );
        }
        
        await transaction.commit();
        res.json({
            success: true,
            message: 'Orders created successfully',
            orders: createdOrders
        });
        
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process checkout'
        });
    }
});

// Get checkout summary
router.get('/summary', authenticateToken, authorizeConsumer, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const cartItems = await db.all(`
            SELECT 
                ci.*,
                m.name,
                m.discounted_price,
                m.original_price,
                m.vendor_id,
                u.business_name as vendor_name
            FROM cart_items ci
            JOIN meals m ON ci.meal_id = m.id
            JOIN users u ON m.vendor_id = u.id
            WHERE ci.user_id = ?
        `, [userId]);
        
        let subtotal = 0;
        let originalTotal = 0;
        
        cartItems.forEach(item => {
            subtotal += item.discounted_price * item.quantity;
            originalTotal += item.original_price * item.quantity;
        });
        
        const savings = originalTotal - subtotal;
        const serviceFeePercentage = parseFloat(process.env.SERVICE_FEE_PERCENTAGE || '0.05'); // Default 5%
        const serviceFee = Math.round(subtotal * serviceFeePercentage); 
        const deliveryFee = parseFloat(process.env.DELIVERY_FEE || '200'); // Default 200
        const finalDeliveryFee = cartItems.length > 0 ? deliveryFee : 0;
        const total = subtotal + serviceFee + finalDeliveryFee;
        
        res.json({
            success: true,
            summary: {
                items: cartItems,
                subtotal,
                serviceFee,
                deliveryFee: finalDeliveryFee,
                total,
                savings,
                itemCount: cartItems.length
            }
        });
        
    } catch (error) {
        console.error('Checkout summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get checkout summary'
        });
    }
});

module.exports = router;
