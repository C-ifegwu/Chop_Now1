const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, validatePasswordReset, validatePasswordUpdate } = require('../middleware/validation');
const emailService = require('../services/email');

// Register new user (Consumer or Vendor)
router.post('/register', validateUserRegistration, async (req, res) => {
    try {
        const { email, password, userType, phone, name, businessName, address } = req.body;

        // Check if user already exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user
        const result = await db.run(
            `INSERT INTO users (email, password, user_type, phone, name, business_name, address, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, hashedPassword, userType, phone || null, name || null, businessName || null, address || null, new Date().toISOString()]
        );

        const userId = result.lastID;

        // Generate JWT token
        const token = jwt.sign(
            { userId: userId, email, userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                email,
                user_type: userType,
                name: name || businessName,
                business_name: businessName,
                phone,
                address
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

// Login
router.post('/login', validateUserLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login
        await db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                user_type: user.user_type,
                name: user.name,
                business_name: user.business_name,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(404).json({ message: 'No user with that email found.' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour

        await db.run(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [token, expires, user.id]
        );

        // Send email
        await emailService.sendPasswordResetEmail(user.email, token);

        res.json({ message: 'Password reset email sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending password reset email.' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await db.get(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
            [token, Date.now()]
        );

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear token
        await db.run(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password.' });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db.get('SELECT id, email, user_type, phone, name, business_name, address FROM users WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { phone, name, businessName, address } = req.body;

        await db.run(
            `UPDATE users SET phone = ?, name = ?, business_name = ?, address = ? WHERE id = ?`,
            [phone, name, businessName, address, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
});

module.exports = router;

