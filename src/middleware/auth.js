const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get JWT secret with fallback for development
const getJWTSecret = () => {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }
    
    // In production, require JWT_SECRET
    if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL ERROR: JWT_SECRET is required in production. Please set it in your environment variables.');
    }
    
    // For development, generate a temporary secret (not secure for production!)
    const defaultSecret = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  WARNING: JWT_SECRET not set. Using temporary secret for development only.');
    console.warn('⚠️  Set JWT_SECRET in environment variables for production deployment.');
    return defaultSecret;
};

const JWT_SECRET = getJWTSecret();

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Middleware to authorize vendor-only routes
function authorizeVendor(req, res, next) {
    if (req.user.userType !== 'vendor') {
        return res.status(403).json({ message: 'Vendor access required' });
    }
    next();
}

// Middleware to authorize consumer-only routes
function authorizeConsumer(req, res, next) {
    if (req.user.userType !== 'consumer') {
        return res.status(403).json({ message: 'Consumer access required' });
    }
    next();
}

module.exports = {
    authenticateToken,
    authorizeVendor,
    authorizeConsumer
};

