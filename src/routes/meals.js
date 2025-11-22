const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeVendor } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validation');
const { mealSchema } = require('../validation/schemas');

// Get all available meals (with filters)
router.get('/', async (req, res) => {
    try {
        const { cuisine, maxPrice, minPrice, search } = req.query;
        
        let query = `SELECT m.*, u.business_name as vendor_name, u.address as vendor_address, u.latitude, u.longitude
                     FROM meals m
                     JOIN users u ON m.vendor_id = u.id
                     WHERE m.is_available = 1 AND m.quantity_available > 0`;
        
        const params = [];

        if (cuisine) {
            query += ' AND m.cuisine_type = ?';
            params.push(cuisine);
        }

        if (minPrice) {
            query += ' AND m.discounted_price >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND m.discounted_price <= ?';
            params.push(maxPrice);
        }

        if (search) {
            query += ' AND (m.name LIKE ? OR m.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY m.created_at DESC';

        const meals = await db.all(query, params);
        res.json(meals);
    } catch (error) {
        console.error('Get meals error:', error);
        res.status(500).json({ message: 'Failed to fetch meals', error: error.message });
    }
});

// Get single meal by ID
router.get('/:id', async (req, res) => {
    try {
        const meal = await db.get(
            `SELECT m.*, u.business_name as vendor_name, u.address as vendor_address, u.latitude, u.longitude,
                    AVG(r.rating) as average_rating, COUNT(r.id) as review_count
             FROM meals m
             JOIN users u ON m.vendor_id = u.id
             LEFT JOIN reviews r ON m.id = r.meal_id
             WHERE m.id = ?`,
            [req.params.id]
        );

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        res.json(meal);
    } catch (error) {
        console.error('Get meal error:', error);
        res.status(500).json({ message: 'Failed to fetch meal', error: error.message });
    }
});

// Create new meal listing (Vendor only)
router.post('/', authenticateToken, authorizeVendor, upload.single('image'), validate(mealSchema), async (req, res) => {
    try {
        const { name, description, originalPrice, discountedPrice, quantityAvailable, 
                cuisineType, pickupOptions, pickupTimes, allergens } = req.body;

        // Business rule: discount must be at least 20%
        const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
        if (discount < 20) {
            return res.status(400).json({ 
                message: 'Meals must be discounted at least 20% off original price' 
            });
        }

        const vendorId = req.user.userId;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await db.run(
            `INSERT INTO meals (vendor_id, name, description, original_price, discounted_price,
                               quantity_available, cuisine_type, pickup_options, pickup_times,
                               allergens, image_url, is_available, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
            [vendorId, name, description, originalPrice, discountedPrice, quantityAvailable,
             cuisineType, pickupOptions, pickupTimes, allergens, imageUrl]
        );

        res.status(201).json({
            message: 'Meal listing created successfully',
            mealId: result.lastID,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Create meal error:', error);
        res.status(500).json({ message: 'Failed to create meal listing', error: error.message });
    }
});

// Update meal listing (Vendor only)
router.put('/:id', authenticateToken, authorizeVendor, validate(mealSchema), async (req, res) => {
    try {
        const mealId = req.params.id;
        const vendorId = req.user.userId;

        // Verify meal belongs to vendor
        const meal = await db.get('SELECT * FROM meals WHERE id = ? AND vendor_id = ?', [mealId, vendorId]);
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found or unauthorized' });
        }

        const { name, description, originalPrice, discountedPrice, quantityAvailable,
                cuisineType, pickupOptions, pickupTimes, allergens, isAvailable } = req.body;

        await db.run(
            `UPDATE meals SET name = ?, description = ?, original_price = ?, discounted_price = ?,
                             quantity_available = ?, cuisine_type = ?, pickup_options = ?,
                             pickup_times = ?, allergens = ?, is_available = ?
             WHERE id = ? AND vendor_id = ?`,
            [name, description, originalPrice, discountedPrice, quantityAvailable,
             cuisineType, pickupOptions, pickupTimes, allergens, isAvailable, mealId, vendorId]
        );

        res.json({ message: 'Meal listing updated successfully' });
    } catch (error) {
        console.error('Update meal error:', error);
        res.status(500).json({ message: 'Failed to update meal listing', error: error.message });
    }
});

// Delete meal listing (Vendor only)
router.delete('/:id', authenticateToken, authorizeVendor, async (req, res) => {
    try {
        const mealId = req.params.id;
        const vendorId = req.user.userId;

        const result = await db.run('DELETE FROM meals WHERE id = ? AND vendor_id = ?', [mealId, vendorId]);
        
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Meal not found or unauthorized' });
        }

        res.json({ message: 'Meal listing deleted successfully' });
    } catch (error) {
        console.error('Delete meal error:', error);
        res.status(500).json({ message: 'Failed to delete meal listing', error: error.message });
    }
});

// Get vendor's own meals
router.get('/vendor/my-meals', authenticateToken, authorizeVendor, async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const meals = await db.all(
            `SELECT m.*, COUNT(o.id) as total_orders
             FROM meals m
             LEFT JOIN orders o ON m.id = o.meal_id
             WHERE m.vendor_id = ?
             GROUP BY m.id
             ORDER BY m.created_at DESC`,
            [vendorId]
        );

        res.json(meals);
    } catch (error) {
        console.error('Get vendor meals error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor meals', error: error.message });
    }
});

module.exports = router;

