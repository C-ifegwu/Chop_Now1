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
        
        let paramIndex = 1;
        const params = [];

        if (cuisine) {
            query += ` AND m.cuisine_type = $${paramIndex++}`;
            params.push(cuisine);
        }

        if (minPrice) {
            query += ` AND m.discounted_price >= $${paramIndex++}`;
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ` AND m.discounted_price <= $${paramIndex++}`;
            params.push(maxPrice);
        }

        if (search) {
            query += ` AND (m.name ILIKE $${paramIndex++} OR m.description ILIKE $${paramIndex++})`; // ILIKE for case-insensitive
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY m.created_at DESC';

        const mealsResult = await db.query(query, params);
        res.json(mealsResult.rows);
    } catch (error) {
        console.error('Get meals error:', error);
        res.status(500).json({ message: 'Failed to fetch meals', error: error.message });
    }
});

// Get single meal by ID
router.get('/:id', async (req, res) => {
    try {
        const mealResult = await db.query(
            `SELECT m.*, u.business_name as vendor_name, u.address as vendor_address, u.latitude, u.longitude,
                    AVG(r.rating) as average_rating, COUNT(r.id) as review_count
             FROM meals m
             JOIN users u ON m.vendor_id = u.id
             LEFT JOIN reviews r ON m.id = r.meal_id
             WHERE m.id = $1
             GROUP BY m.id, u.business_name, u.address, u.latitude, u.longitude`, // Added GROUP BY for aggregate functions
            [req.params.id]
        );
        const meal = mealResult.rows[0];

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

        const result = await db.query(
            `INSERT INTO meals (vendor_id, name, description, original_price, discounted_price,
                               quantity_available, cuisine_type, pickup_options, pickup_times,
                               allergens, image_url, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE) RETURNING id`,
            [vendorId, name, description, originalPrice, discountedPrice, quantityAvailable,
             cuisineType, pickupOptions, pickupTimes, allergens, imageUrl]
        );

        res.status(201).json({
            message: 'Meal listing created successfully',
            mealId: result.rows[0].id,
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
        const mealResult = await db.query('SELECT * FROM meals WHERE id = $1 AND vendor_id = $2', [mealId, vendorId]);
        if (mealResult.rows.length === 0) {
            return res.status(404).json({ message: 'Meal not found or unauthorized' });
        }

        const { name, description, originalPrice, discountedPrice, quantityAvailable,
                cuisineType, pickupOptions, pickupTimes, allergens, isAvailable } = req.body;

        await db.query(
            `UPDATE meals SET name = $1, description = $2, original_price = $3, discounted_price = $4,
                             quantity_available = $5, cuisine_type = $6, pickup_options = $7,
                             pickup_times = $8, allergens = $9, is_available = $10, updated_at = NOW()
             WHERE id = $11 AND vendor_id = $12`,
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

        const result = await db.query('DELETE FROM meals WHERE id = $1 AND vendor_id = $2', [mealId, vendorId]);
        
        if (result.rowCount === 0) {
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
        const mealsResult = await db.query(
            `SELECT m.*, COUNT(o.id) as total_orders
             FROM meals m
             LEFT JOIN order_items oi ON m.id = oi.meal_id
             LEFT JOIN orders o ON oi.order_id = o.id
             WHERE m.vendor_id = $1
             GROUP BY m.id
             ORDER BY m.created_at DESC`,
            [vendorId]
        );

        res.json(mealsResult.rows);
    } catch (error) {
        console.error('Get vendor meals error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor meals', error: error.message });
    }
});

module.exports = router;

