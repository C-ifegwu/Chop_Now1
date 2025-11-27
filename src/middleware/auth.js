const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get JWT secret with fallback for development
const getJWTSecret = () => {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }
    
    // Generate a temporary secret (not secure for production!)
    const defaultSecret = crypto.randomBytes(32).toString('hex');
    
    if (process.env.NODE_ENV === 'production') {
        console.error('🚨 CRITICAL SECURITY WARNING: JWT_SECRET is not set in production!');
        console.error('🚨 Using a temporary secret that will change on each restart.');
        console.error('🚨 This is INSECURE - all existing tokens will be invalidated on restart.');
        console.error('🚨 Please set JWT_SECRET in Railway environment variables immediately!');
        console.error('🚨 Generate a secure secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    } else {
        console.warn('⚠️  WARNING: JWT_SECRET not set. Using temporary secret for development only.');
        console.warn('⚠️  Set JWT_SECRET in environment variables for production deployment.');
    }
    
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

