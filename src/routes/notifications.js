const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all notifications for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notificationsResult = await db.query(
            `SELECT * FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.user.userId]
        );

        res.json(notificationsResult.rows);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
});

// Get unread notifications count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT COUNT(*) as count FROM notifications
             WHERE user_id = $1 AND is_read = FALSE`,
            [req.user.userId]
        );

        res.json({ count: result.rows[0].count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.query(
            `UPDATE notifications SET is_read = TRUE
             WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await db.query(
            `UPDATE notifications SET is_read = TRUE
             WHERE user_id = $1`,
            [req.user.userId]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Failed to mark all as read', error: error.message });
    }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query(
            `DELETE FROM notifications
             WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
});

module.exports = router;
