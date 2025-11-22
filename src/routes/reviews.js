const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Create review (Consumer only, after order completion)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'consumer') {
            return res.status(403).json({ message: 'Only consumers can create reviews' });
        }

        const { mealId, rating, comment } = req.body;
        const consumerId = req.user.userId;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Verify order was completed
        const order = await db.get(
            'SELECT * FROM orders WHERE consumer_id = ? AND meal_id = ? AND status = ?',
            [consumerId, mealId, 'completed']
        );

        if (!order) {
            return res.status(400).json({ message: 'Can only review completed orders' });
        }

        // Check if review already exists
        const existingReview = await db.get(
            'SELECT * FROM reviews WHERE consumer_id = ? AND meal_id = ?',
            [consumerId, mealId]
        );

        if (existingReview) {
            return res.status(400).json({ message: 'Review already exists for this meal' });
        }

        const result = await db.run(
            `INSERT INTO reviews (consumer_id, meal_id, rating, comment, created_at)
             VALUES (?, ?, ?, ?, datetime('now'))`,
            [consumerId, mealId, rating, comment]
        );

        res.status(201).json({
            message: 'Review created successfully',
            reviewId: result.lastID
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Failed to create review', error: error.message });
    }
});

// Get reviews for a meal
router.get('/meal/:mealId', async (req, res) => {
    try {
        const reviews = await db.all(
            `SELECT r.*, u.name as consumer_name
             FROM reviews r
             JOIN users u ON r.consumer_id = u.id
             WHERE r.meal_id = ?
             ORDER BY r.created_at DESC`,
            [req.params.mealId]
        );

        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
});

// Get reviews for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const reviews = await db.all(
            `SELECT r.*, m.name as meal_name, u.name as consumer_name
             FROM reviews r
             JOIN meals m ON r.meal_id = m.id
             JOIN users u ON r.consumer_id = u.id
             WHERE m.vendor_id = ?
             ORDER BY r.created_at DESC`,
            [req.params.vendorId]
        );

        res.json(reviews);
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
        const review = await db.get(
            `SELECT r.* FROM reviews r
             JOIN meals m ON r.meal_id = m.id
             WHERE r.id = ? AND m.vendor_id = ?`,
            [reviewId, req.user.userId]
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        await db.run('UPDATE reviews SET vendor_response = ?, response_date = datetime("now") WHERE id = ?', 
                    [response, reviewId]);

        res.json({ message: 'Response added successfully' });
    } catch (error) {
        console.error('Add response error:', error);
        res.status(500).json({ message: 'Failed to add response', error: error.message });
    }
});

module.exports = router;

