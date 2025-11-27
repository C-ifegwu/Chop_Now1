const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const session = require('express-session'); // Import express-session
require('dotenv').config();

// Import middleware and utilities
const { securityHeaders, generalRateLimit, apiRateLimit, secureSession, csrfProtection } = require('./middleware/security'); // Import secureSession and csrfProtection
const { httpLogger, logger } = require('./utils/logger');
const db = require('./config/database');

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://www.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.paystack.co", "https://maps.googleapis.com"],
            frameSrc: ["'self'", "https://www.google.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"]
        }
    }
}));

app.use(securityHeaders);
app.use(generalRateLimit);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://chopnow.com']
        : ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session(secureSession));

// CSRF Protection middleware - should come after session middleware
app.use(csrfProtection);

// HTTP logging
app.use(httpLogger);

// Static file serving
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes with rate limiting
app.use('/api', apiRateLimit);
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const dbHealth = await db.healthCheck();
        const stats = await db.getStats();
        
        res.json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbHealth,
            stats: stats,
            version: process.env.npm_package_version || '1.0.0'
        });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'ChopNow API',
        version: '1.0.0',
        description: 'Food rescue platform API',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'User login',
                'POST /api/auth/logout': 'User logout',
                'POST /api/auth/forgot-password': 'Request password reset',
                'POST /api/auth/reset-password': 'Reset password',
                'GET /api/auth/profile': 'Get user profile',
                'PUT /api/auth/profile': 'Update user profile'
            },
            meals: {
                'GET /api/meals': 'Get all meals',
                'GET /api/meals/:id': 'Get meal by ID',
                'POST /api/meals': 'Create new meal (vendor only)',
                'PUT /api/meals/:id': 'Update meal (vendor only)',
                'DELETE /api/meals/:id': 'Delete meal (vendor only)'
            },
            orders: {
                'GET /api/orders': 'Get user orders',
                'GET /api/orders/:id': 'Get order by ID',
                'POST /api/orders': 'Create new order',
                'PUT /api/orders/:id/status': 'Update order status (vendor only)'
            },
            reviews: {
                'GET /api/reviews/meal/:mealId': 'Get meal reviews',
                'POST /api/reviews': 'Create review',
                'PUT /api/reviews/:id/response': 'Respond to review (vendor only)'
            },
            notifications: {
                'GET /api/notifications': 'Get user notifications',
                'PUT /api/notifications/:id/read': 'Mark notification as read'
            }
        }
    });
});

// WebSocket server for real-time features
const WebSocket = require('ws');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const server = http.createServer(app);

const wss = new WebSocket.Server({ 
    server,
    verifyClient: (info, done) => {
        const protocol = info.req.headers['sec-websocket-protocol'];
        if (!protocol) {
            logger.warn('WebSocket connection attempt without protocol header.');
            return done(false, 401, 'Unauthorized: No token provided');
        }

        // Assuming the protocol header contains the token like "Bearer <token>"
        const token = protocol.split(' ')[1]; 
        if (!token) {
            logger.warn('WebSocket connection attempt without token in protocol.');
            return done(false, 401, 'Unauthorized: No token provided');
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                logger.warn('WebSocket connection attempt with invalid token.', { error: err.message });
                return done(false, 403, 'Forbidden: Invalid or expired token');
            }
            // Attach user info to the request for the 'connection' event handler
            info.req.user = user; 
            logger.info('WebSocket client authenticated successfully.', { userId: user.userId });
            done(true);
        });
    }
});

wss.on('connection', (ws, req) => {
    // req.user is populated by the verifyClient function
    ws.userId = req.user.userId; 
    ws.userType = req.user.userType;
    logger.info('New WebSocket connection established', { 
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        userId: ws.userId,
        userType: ws.userType
    });
    
    // Immediately send confirmation to the client
    ws.send(JSON.stringify({
        type: 'connection_confirmed',
        message: 'Successfully connected to real-time updates'
    }));

    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            logger.debug('WebSocket message received', { type: data.type, userId: ws.userId });
            
            // Handle different message types
            switch (data.type) {
                case 'order_update':
                    // Broadcast order updates to relevant users
                    broadcastToUser(data.vendorId, {
                        type: 'order_update',
                        orderId: data.orderId,
                        status: data.status,
                        timestamp: new Date().toISOString()
                    });
                    break;
                    
                case 'meal_availability':
                    // Broadcast meal availability updates
                    broadcastToUserType('consumer', {
                        type: 'meal_availability',
                        mealId: data.mealId,
                        available: data.available,
                        quantity: data.quantity
                    });
                    break;
                    
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
                    
                default:
                    logger.warn('Unknown WebSocket message type', { type: data.type });
            }
        } catch (error) {
            logger.error('Error parsing WebSocket message', { 
                error: error.message,
                message: message.toString()
            });
        }
    });
    
    ws.on('close', (code, reason) => {
        logger.info('WebSocket connection closed', { 
            code, 
            reason: reason.toString(),
            userId: ws.userId 
        });
    });
    
    ws.on('error', (error) => {
        logger.error('WebSocket error', { 
            error: error.message,
            userId: ws.userId 
        });
    });
});

// WebSocket heartbeat to detect broken connections
const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            logger.info('Terminating inactive WebSocket connection', { userId: ws.userId });
            return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(heartbeat);
});

// Broadcast message to specific user
function broadcastToUser(userId, message) {
    let sent = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.userId === userId) {
            client.send(JSON.stringify(message));
            sent++;
        }
    });
    
    if (sent > 0) {
        logger.debug('Message broadcast to user', { userId, messageType: message.type, clientsSent: sent });
    }
}

// Broadcast message to all users of a specific type
function broadcastToUserType(userType, message) {
    let sent = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.userType === userType) {
            client.send(JSON.stringify(message));
            sent++;
        }
    });
    
    if (sent > 0) {
        logger.debug('Message broadcast to user type', { userType, messageType: message.type, clientsSent: sent });
    }
}

// Broadcast message to all connected clients
function broadcastToAll(message) {
    let sent = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
            sent++;
        }
    });
    
    logger.debug('Message broadcast to all clients', { messageType: message.type, clientsSent: sent });
}

// Make broadcast functions available globally
global.broadcastToUser = broadcastToUser;
global.broadcastToUserType = broadcastToUserType;
global.broadcastToAll = broadcastToAll;

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        userId: req.user?.id
    });
    
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
    });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    } else {
        // Serve index.html for SPA routes
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        db.close();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        db.close();
        process.exit(0);
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    logger.info('ChopNow server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    });
    
    console.log(`🚀 ChopNow server running on port ${PORT}`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready for real-time connections`);
    console.log(`📚 API documentation at http://localhost:${PORT}/api/docs`);
    console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
});

module.exports = app;