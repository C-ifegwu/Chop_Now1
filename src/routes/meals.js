const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeVendor } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateMeal } = require('../middleware/validation');

// Get vendor's meals
router.get('/vendor', authenticateToken, authorizeVendor, async (req, res) => {
    try {
        const vendorId = req.user.userId;
        
        const meals = await db.all(
            'SELECT * FROM meals WHERE vendor_id = ? ORDER BY created_at DESC',
            [vendorId]
        );
        
        res.json(meals);
    } catch (error) {
        console.error('Get vendor meals error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor meals', error: error.message });
    }
});

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
            query += ` AND m.cuisine_type = ?`;
            params.push(cuisine);
        }

        if (minPrice) {
            query += ` AND m.discounted_price >= ?`;
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ` AND m.discounted_price <= ?`;
            params.push(maxPrice);
        }

        if (search) {
            query += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
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
            `SELECT m.*, u.business_name as vendor_name, u.address as vendor_address, u.latitude, u.longitude
             FROM meals m
             JOIN users u ON m.vendor_id = u.id
             WHERE m.id = ?`,
            [req.params.id]
        );

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        // Get reviews separately
        const reviews = await db.all(
            'SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM reviews WHERE meal_id = ?',
            [req.params.id]
        );

        meal.average_rating = reviews[0]?.average_rating || 0;
        meal.review_count = reviews[0]?.review_count || 0;

        res.json(meal);
    } catch (error) {
        console.error('Get meal error:', error);
        res.status(500).json({ message: 'Failed to fetch meal', error: error.message });
    }
});

// Create new meal listing (Vendor only)
router.post('/', authenticateToken, authorizeVendor, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ 
                message: 'File upload failed', 
                error: err.message 
            });
        }
        next();
    });
}, validateMeal, async (req, res) => {
    try {
        // Parse and convert values from form data (multer sends everything as strings)
        // Support both camelCase and snake_case field names
        const name = req.body.name?.trim();
        const description = req.body.description?.trim() || null;
        const originalPrice = parseFloat(req.body.originalPrice || req.body.original_price);
        const discountedPrice = parseFloat(req.body.discountedPrice || req.body.discounted_price);
        const quantityAvailable = parseInt(req.body.quantityAvailable || req.body.quantity_available, 10);
        const cuisineType = req.body.cuisineType || req.body.cuisine_type || null;
        const pickupOptions = req.body.pickupOptions || req.body.pickup_options || null;
        const pickupTimes = req.body.pickupTimes || req.body.pickup_times || req.body.pickup_time || null;
        
        // Parse allergens if it's a JSON string
        let allergens = req.body.allergens || null;
        if (allergens && typeof allergens === 'string') {
            try {
                allergens = JSON.parse(allergens);
            } catch (e) {
                // If it's not valid JSON, treat as null
                allergens = null;
            }
        }

        // Validate parsed values
        if (isNaN(originalPrice) || originalPrice <= 0) {
            return res.status(400).json({ 
                message: 'Invalid original price' 
            });
        }
        
        if (isNaN(discountedPrice) || discountedPrice <= 0) {
            return res.status(400).json({ 
                message: 'Invalid discounted price' 
            });
        }
        
        if (isNaN(quantityAvailable) || quantityAvailable <= 0) {
            return res.status(400).json({ 
                message: 'Invalid quantity available' 
            });
        }

        // Business rule: discount must be at least 20%
        const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
        if (discount < 20) {
            return res.status(400).json({ 
                message: 'Meals must be discounted at least 20% off original price' 
            });
        }

        const vendorId = req.user.userId;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Convert allergens to JSON string for database storage
        const allergensJson = allergens ? JSON.stringify(allergens) : null;

        const result = await db.run(
            `INSERT INTO meals (vendor_id, name, description, original_price, discounted_price,
                               quantity_available, cuisine_type, pickup_options, pickup_times,
                               allergens, image_url, is_available)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [vendorId, name, description, originalPrice, discountedPrice, quantityAvailable,
             cuisineType, pickupOptions, pickupTimes, allergensJson, imageUrl]
        );

        res.status(201).json({
            message: 'Meal listing created successfully',
            mealId: result.lastID,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Create meal error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Failed to create meal listing', 
            error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
});

// Update meal listing (Vendor only)
router.put('/:id', authenticateToken, authorizeVendor, validateMeal, async (req, res) => {
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
                             pickup_times = ?, allergens = ?, is_available = ?, updated_at = datetime('now')
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
        const mealsResult = await db.all(
            `SELECT m.*, COUNT(o.id) as total_orders
             FROM meals m
             LEFT JOIN order_items oi ON m.id = oi.meal_id
             LEFT JOIN orders o ON oi.order_id = o.id
             WHERE m.vendor_id = ?
             GROUP BY m.id
             ORDER BY m.created_at DESC`,
            [vendorId]
        );

        res.json(mealsResult);
    } catch (error) {
        console.error('Get vendor meals error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor meals', error: error.message });
    }
});

module.exports = router;

