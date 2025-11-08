const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
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

