const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security (HTTPS only)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.google.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://api.paystack.co https://maps.googleapis.com; " +
        "frame-src 'self' https://www.google.com; " +
        "object-src 'none'; " +
        "base-uri 'self';"
    );
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(self), payment=(self)'
    );
    
    next();
};

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: message || 'Too many requests, please try again later.',
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message: message || 'Too many requests, please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

// Different rate limits for different endpoints
const generalRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP');
const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts');
const apiRateLimit = createRateLimit(15 * 60 * 1000, 1000, 'API rate limit exceeded');

// CSRF protection
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
    // Skip CSRF for API endpoints using JWT authentication
    // JWT tokens in Authorization headers are not vulnerable to CSRF attacks
    const isAPIEndpoint = req.path.startsWith('/api/');
    const hasJWTToken = req.headers['authorization']?.startsWith('Bearer ');
    
    // Skip CSRF for authenticated API requests (JWT-based)
    if (isAPIEndpoint && hasJWTToken) {
        return next();
    }
    
    // Skip CSRF for public API endpoints (registration, login, etc.)
    // These endpoints don't use sessions and are stateless
    if (isAPIEndpoint) {
        return next();
    }
    
    // For non-API endpoints (like form submissions), check CSRF token
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const token = req.headers['x-csrf-token'] || req.body._csrf;
        const sessionToken = req.session?.csrfToken;
        
        if (!token || !sessionToken || token !== sessionToken) {
            return res.status(403).json({
                success: false,
                message: 'Invalid CSRF token'
            });
        }
    }
    next();
};

// Input sanitization
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};

// SQL injection prevention (for raw queries)
const escapeSQL = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '');
};

// Encryption utilities for sensitive data
const encrypt = (text) => {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY;
    if (!secretKey) {
        throw new Error('ENCRYPTION_KEY is not defined in environment variables.');
    }
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
    cipher.setAAD(Buffer.from('chopnow-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

const decrypt = (encryptedData) => {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY;
    if (!secretKey) {
        throw new Error('ENCRYPTION_KEY is not defined in environment variables.');
    }
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAAD(Buffer.from('chopnow-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};

// Session security
// Generate a default secret for development if not provided
const getSessionSecret = () => {
    if (process.env.SESSION_SECRET) {
        return process.env.SESSION_SECRET;
    }
    
    // Generate a temporary secret (not secure for production!)
    const defaultSecret = crypto.randomBytes(32).toString('hex');
    
    if (process.env.NODE_ENV === 'production') {
        console.error('🚨 CRITICAL SECURITY WARNING: SESSION_SECRET is not set in production!');
        console.error('🚨 Using a temporary secret that will change on each restart.');
        console.error('🚨 This is INSECURE - sessions will be invalidated on restart.');
        console.error('🚨 Please set SESSION_SECRET in Railway environment variables immediately!');
        console.error('🚨 Generate a secure secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    } else {
        console.warn('⚠️  WARNING: SESSION_SECRET not set. Using temporary secret for development only.');
        console.warn('⚠️  Set SESSION_SECRET in environment variables for production deployment.');
    }
    
    return defaultSecret;
};

const secureSession = {
    name: 'chopnow.sid',
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict' // CSRF protection
    }
};

// Audit logging
const auditLog = (action, userId, details = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        userId,
        details,
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown'
    };
    
    // In production, this should write to a secure audit log
    console.log('AUDIT:', JSON.stringify(logEntry));
};

// Security event monitoring
const securityEvents = {
    FAILED_LOGIN: 'failed_login',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    UNAUTHORIZED_ACCESS: 'unauthorized_access',
    DATA_BREACH_ATTEMPT: 'data_breach_attempt'
};

const logSecurityEvent = (event, userId, details = {}) => {
    const eventLog = {
        timestamp: new Date().toISOString(),
        event,
        userId,
        details,
        severity: details.severity || 'medium'
    };
    
    // In production, this should trigger alerts for high-severity events
    console.log('SECURITY EVENT:', JSON.stringify(eventLog));
    
    // Trigger alerts for critical events
    if (details.severity === 'high') {
        // Send alert to security team
        console.log('🚨 HIGH SEVERITY SECURITY EVENT DETECTED');
    }
};

// Brute force protection
const bruteForceProtection = new Map();

const checkBruteForce = (identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const key = req.ip + ':' + identifier;
        const now = Date.now();
        
        if (!bruteForceProtection.has(key)) {
            bruteForceProtection.set(key, { attempts: 0, lastAttempt: now });
        }
        
        const record = bruteForceProtection.get(key);
        
        // Reset if window has passed
        if (now - record.lastAttempt > windowMs) {
            record.attempts = 0;
            record.lastAttempt = now;
        }
        
        if (record.attempts >= maxAttempts) {
            logSecurityEvent(securityEvents.SUSPICIOUS_ACTIVITY, null, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'high',
                reason: 'Brute force attempt detected'
            });
            
            return res.status(429).json({
                success: false,
                message: 'Too many failed attempts. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
        
        // Increment attempts on failure (to be called in route handlers)
        req.incrementBruteForce = () => {
            record.attempts++;
            record.lastAttempt = now;
        };
        
        next();
    };
};

module.exports = {
    securityHeaders,
    generalRateLimit,
    authRateLimit,
    apiRateLimit,
    generateCSRFToken,
    csrfProtection,
    sanitizeInput,
    escapeSQL,
    encrypt,
    decrypt,
    secureSession,
    auditLog,
    logSecurityEvent,
    securityEvents,
    checkBruteForce,
    bruteForceProtection
};
