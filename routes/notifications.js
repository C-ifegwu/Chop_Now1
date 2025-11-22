const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all notifications for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await db.all(
            `SELECT * FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.user.userId]
        );

        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
});

// Get unread notifications count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const result = await db.get(
            `SELECT COUNT(*) as count FROM notifications
             WHERE user_id = ? AND is_read = 0`,
            [req.user.userId]
        );

        res.json({ count: result.count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.run(
            `UPDATE notifications SET is_read = 1
             WHERE id = ? AND user_id = ?`,
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
        await db.run(
            `UPDATE notifications SET is_read = 1
             WHERE user_id = ?`,
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
        await db.run(
            `DELETE FROM notifications
             WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user.userId]
        );

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
});

module.exports = router;
