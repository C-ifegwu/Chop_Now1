const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const cartItems = await db.all(`
            SELECT 
                ci.*,
                m.name,
                m.description,
                m.image_url,
                m.original_price,
                m.discounted_price,
                m.quantity_available,
                u.business_name as vendor_name
            FROM cart_items ci
            JOIN meals m ON ci.meal_id = m.id
            JOIN users u ON m.vendor_id = u.id
            WHERE ci.user_id = ?
            ORDER BY ci.created_at DESC
        `, [userId]);
        
        res.json({
            success: true,
            items: cartItems
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart items'
        });
    }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { mealId, quantity = 1 } = req.body;
        
        if (!mealId) {
            return res.status(400).json({
                success: false,
                message: 'Meal ID is required'
            });
        }
        
        // Check if meal exists and is available
        const meal = await db.get('SELECT * FROM meals WHERE id = ? AND is_available = 1', [mealId]);
        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found or not available'
            });
        }
        
        if (meal.quantity_available < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Not enough quantity available'
            });
        }
        
        // Check if item already exists in cart
        const existingItem = await db.get(
            'SELECT * FROM cart_items WHERE user_id = ? AND meal_id = ?',
            [userId, mealId]
        );
        
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > meal.quantity_available) {
                return res.status(400).json({
                    success: false,
                    message: 'Not enough quantity available'
                });
            }
            
            await db.run(
                'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?',
                [newQuantity, new Date().toISOString(), existingItem.id]
            );
        } else {
            // Add new item
            await db.run(
                'INSERT INTO cart_items (user_id, meal_id, quantity, created_at) VALUES (?, ?, ?, ?)',
                [userId, mealId, quantity, new Date().toISOString()]
            );
        }
        
        res.json({
            success: true,
            message: 'Item added to cart successfully'
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart'
        });
    }
});

// Update cart item quantity
router.put('/update/:itemId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }
        
        // Check if cart item belongs to user
        const cartItem = await db.get(
            'SELECT ci.*, m.quantity_available FROM cart_items ci JOIN meals m ON ci.meal_id = m.id WHERE ci.id = ? AND ci.user_id = ?',
            [itemId, userId]
        );
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        if (quantity > cartItem.quantity_available) {
            return res.status(400).json({
                success: false,
                message: 'Not enough quantity available'
            });
        }
        
        await db.run(
            'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?',
            [quantity, new Date().toISOString(), itemId]
        );
        
        res.json({
            success: true,
            message: 'Cart item updated successfully'
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item'
        });
    }
});

// Remove item from cart
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;
        
        // Check if cart item belongs to user
        const cartItem = await db.get(
            'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
            [itemId, userId]
        );
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        await db.run('DELETE FROM cart_items WHERE id = ?', [itemId]);
        
        res.json({
            success: true,
            message: 'Item removed from cart successfully'
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove cart item'
        });
    }
});

// Clear entire cart
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        
        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart'
        });
    }
});

module.exports = router;
