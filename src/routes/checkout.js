const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeConsumer } = require('../middleware/auth');

// Create order from cart
router.post('/create-order', authenticateToken, authorizeConsumer, async (req, res) => {
    let transaction;
    try {
        // Start transaction
        transaction = await db.beginTransaction();
        const userId = req.user.userId;
        const { deliveryAddress, paymentMethod } = req.body;
        
        // Get cart items
        let cartItems;
        try {
            cartItems = await db.all(`
                SELECT 
                    ci.id as cart_item_id,
                    ci.user_id,
                    ci.meal_id,
                    ci.quantity,
                    m.name,
                    m.discounted_price,
                    m.original_price,
                    m.vendor_id,
                    m.quantity_available,
                    u.business_name as vendor_name
                FROM cart_items ci
                JOIN meals m ON ci.meal_id = m.id
                JOIN users u ON m.vendor_id = u.id
                WHERE ci.user_id = ?
            `, [userId]);
        } catch (queryError) {
            await transaction.rollback();
            console.error('Error fetching cart items:', queryError);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch cart items',
                error: process.env.NODE_ENV === 'production' ? undefined : queryError.message
            });
        }
        
        if (!cartItems || cartItems.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cart is empty. Please add items to your cart before checkout.'
            });
        }
        
        // Validate meal availability
        for (const item of cartItems) {
            if (!item.quantity_available || item.quantity_available < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient quantity available for ${item.name || 'meal'}. Only ${item.quantity_available || 0} available.`
                });
            }
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
            // Calculate service fee
            const serviceFeePercentage = parseFloat(process.env.SERVICE_FEE_PERCENTAGE || '0.05');
            const serviceFee = Math.round(vendorOrder.totalAmount * serviceFeePercentage);
            const deliveryFee = parseFloat(process.env.DELIVERY_FEE || '200');
            const totalAmount = vendorOrder.totalAmount + serviceFee + deliveryFee;
            
            // Create order
            const orderResult = await db.run(
                `INSERT INTO orders (consumer_id, vendor_id, total_amount, status, payment_method, payment_status, delivery_address, created_at)
                 VALUES (?, ?, ?, 'pending', ?, 'pending', ?, ?)`,
                [userId, vendorOrder.vendorId, totalAmount, paymentMethod || 'card', deliveryAddress || 'Not specified', new Date().toISOString()]
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
                totalAmount: totalAmount,
                itemCount: vendorOrder.items.length
            });
        }
        
        // Clear cart
        await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        // Simulate successful payment (in production, integrate with payment gateway)
        for (const order of createdOrders) {
            await db.run(
                'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
                ['completed', 'confirmed', order.orderId]
            );
        }
        
        // Commit transaction
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Orders created successfully',
            orders: createdOrders
        });
        
    } catch (error) {
        // Rollback transaction on error
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }
        console.error('Checkout error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to process checkout',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
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
