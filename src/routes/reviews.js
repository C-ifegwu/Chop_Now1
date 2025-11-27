const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeConsumer } = require('../middleware/auth');

// Create review (Consumer only, after order completion)
router.post('/', authenticateToken, authorizeConsumer, async (req, res) => {
    try {
        const { mealId, rating, comment } = req.body;
        const consumerId = req.user.userId;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Verify order was completed for this meal
        const orderResult = await db.query(
            `SELECT o.id
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.consumer_id = $1 AND oi.meal_id = $2 AND o.status = 'completed'`,
            [consumerId, mealId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(400).json({ message: 'Can only review meals from completed orders' });
        }

        // Check if review already exists
        const existingReviewResult = await db.query(
            'SELECT * FROM reviews WHERE consumer_id = $1 AND meal_id = $2',
            [consumerId, mealId]
        );

        if (existingReviewResult.rows.length > 0) {
            return res.status(400).json({ message: 'Review already exists for this meal' });
        }

        const result = await db.query(
            `INSERT INTO reviews (consumer_id, meal_id, rating, comment)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [consumerId, mealId, rating, comment]
        );

        res.status(201).json({
            message: 'Review created successfully',
            reviewId: result.rows[0].id
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Failed to create review', error: error.message });
    }
});

// Get reviews for a meal
router.get('/meal/:mealId', async (req, res) => {
    try {
        const reviewsResult = await db.query(
            `SELECT r.*, u.name as consumer_name
             FROM reviews r
             JOIN users u ON r.consumer_id = u.id
             WHERE r.meal_id = $1
             ORDER BY r.created_at DESC`,
            [req.params.mealId]
        );

        res.json(reviewsResult.rows);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
});

// Get reviews for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const reviewsResult = await db.query(
            `SELECT r.*, m.name as meal_name, u.name as consumer_name
             FROM reviews r
             JOIN meals m ON r.meal_id = m.id
             JOIN users u ON r.consumer_id = u.id
             WHERE m.vendor_id = $1
             ORDER BY r.created_at DESC`,
            [req.params.vendorId]
        );

        res.json(reviewsResult.rows);
    } catch (error) {
        console.error('Get vendor reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
});

// Vendor response to review
router.post('/:reviewId/response', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'vendor') {
            return res.status(403).json({ message: 'Only vendors can respond to reviews' });
        }

        const { response } = req.body;
        const reviewId = req.params.reviewId;

        // Verify review is for vendor's meal
        const reviewResult = await db.query(
            `SELECT r.* FROM reviews r
             JOIN meals m ON r.meal_id = m.id
             WHERE r.id = $1 AND m.vendor_id = $2`,
            [reviewId, req.user.userId]
        );
        const review = reviewResult.rows[0];

        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        await db.query('UPDATE reviews SET vendor_response = $1, response_date = NOW() WHERE id = $2', 
                    [response, reviewId]);

        res.json({ message: 'Response added successfully' });
    } catch (error) {
        console.error('Add response error:', error);
        res.status(500).json({ message: 'Failed to add response', error: error.message });
    }
});

module.exports = router;

