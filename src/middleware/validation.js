const { body, validationResult } = require('express-validator');

// Common validation rules
const emailValidation = body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long');

const nameValidation = body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods');

const phoneValidation = body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number');

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value
        }));
        
        console.error('Validation errors:', errorMessages);
        console.error('Request body:', req.body);
        
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    emailValidation,
    passwordValidation,
    nameValidation,
    phoneValidation,
    body('userType')
        .isIn(['consumer', 'vendor'])
        .withMessage('User type must be either consumer or vendor'),
    
    // Vendor-specific validations
    body('businessName')
        .if(body('userType').equals('vendor'))
        .notEmpty()
        .withMessage('Business name is required for vendors')
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),
    
    body('address')
        .if(body('userType').equals('vendor'))
        .notEmpty()
        .withMessage('Address is required for vendors')
        .isLength({ min: 5, max: 200 })
        .withMessage('Address must be between 5 and 200 characters'),
    
    validateRequest
];

// User login validation
const validateUserLogin = [
    emailValidation,
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
];

// Password reset validation
const validatePasswordReset = [
    emailValidation,
    validateRequest
];

const validatePasswordUpdate = [
    body('token').notEmpty().withMessage('Reset token is required'),
    passwordValidation,
    validateRequest
];

// Custom middleware to normalize field names (snake_case to camelCase)
const normalizeMealFields = (req, res, next) => {
    // Normalize snake_case to camelCase for validation
    if (req.body.original_price && !req.body.originalPrice) {
        req.body.originalPrice = req.body.original_price;
    }
    if (req.body.discounted_price && !req.body.discountedPrice) {
        req.body.discountedPrice = req.body.discounted_price;
    }
    if (req.body.quantity_available && !req.body.quantityAvailable) {
        req.body.quantityAvailable = req.body.quantity_available;
    }
    if (req.body.cuisine_type && !req.body.cuisineType) {
        req.body.cuisineType = req.body.cuisine_type;
    }
    if (req.body.pickup_options && !req.body.pickupOptions) {
        req.body.pickupOptions = req.body.pickup_options;
    }
    if (req.body.pickup_times && !req.body.pickupTimes) {
        req.body.pickupTimes = req.body.pickup_times;
    }
    if (req.body.pickup_time && !req.body.pickupTimes) {
        req.body.pickupTimes = req.body.pickup_time;
    }
    next();
};

// Meal validation - simplified to work with both formats
const validateMeal = [
    normalizeMealFields,
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Meal name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Meal name must be between 2 and 100 characters'),
    
    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    
    body('originalPrice')
        .notEmpty()
        .withMessage('Original price is required')
        .custom((value) => {
            const num = parseFloat(value);
            if (isNaN(num) || num <= 0) {
                throw new Error('Original price must be a valid positive number');
            }
            if (num < 0.01 || num > 1000000) {
                throw new Error('Original price must be between $0.01 and $1,000,000');
            }
            return true;
        }),
    
    body('discountedPrice')
        .notEmpty()
        .withMessage('Discounted price is required')
        .custom((value) => {
            const num = parseFloat(value);
            if (isNaN(num) || num <= 0) {
                throw new Error('Discounted price must be a valid positive number');
            }
            if (num < 0.01 || num > 1000000) {
                throw new Error('Discounted price must be between $0.01 and $1,000,000');
            }
            return true;
        })
        .custom((value, { req }) => {
            const originalPrice = parseFloat(req.body.originalPrice);
            const discountedPrice = parseFloat(value);
            
            if (isNaN(originalPrice) || isNaN(discountedPrice)) {
                return true; // Let other validators handle NaN
            }
            
            if (discountedPrice >= originalPrice) {
                throw new Error('Discounted price must be less than original price');
            }
            const discountPercentage = ((originalPrice - discountedPrice) / originalPrice) * 100;
            if (discountPercentage < 20) {
                throw new Error('Discount must be at least 20%');
            }
            return true;
        }),
    
    body('quantityAvailable')
        .notEmpty()
        .withMessage('Quantity available is required')
        .custom((value) => {
            const num = parseInt(value, 10);
            if (isNaN(num) || num <= 0) {
                throw new Error('Quantity available must be a valid positive integer');
            }
            if (num < 1 || num > 1000) {
                throw new Error('Quantity available must be between 1 and 1000');
            }
            return true;
        }),
    
    body('cuisineType')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (!value) return true; // Optional field
            const validTypes = ['african', 'american', 'asian', 'european', 'indian', 'mediterranean', 'mexican', 'mixed'];
            if (!validTypes.includes(value)) {
                throw new Error('Invalid cuisine type');
            }
            return true;
        }),
    
    body('mealType')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert'])
        .withMessage('Invalid meal type'),
    
    body('dietaryRestrictions')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (!value || value === '') return true;
            // Allow both JSON string and array
            if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    return false;
                }
            }
            return Array.isArray(value);
        })
        .withMessage('Dietary restrictions must be a valid JSON array or array'),
    
    body('allergens')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (!value || value === '') return true;
            // Allow both JSON string and array
            if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    return false;
                }
            }
            return Array.isArray(value);
        })
        .withMessage('Allergens must be a valid JSON array or array'),
    
    body('pickupOptions')
        .optional({ nullable: true, checkFalsy: true }),
    
    body('pickupTimes')
        .optional({ nullable: true, checkFalsy: true }),
    
    validateRequest
];

// Order validation
const validateOrder = [
    body('items')
        .isArray({ min: 1, max: 10 })
        .withMessage('Order must contain between 1 and 10 items'),
    
    body('items.*.mealId')
        .isInt({ min: 1 })
        .withMessage('Valid meal ID is required for each item'),
    
    body('items.*.quantity')
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10 for each item'),
    
    body('paymentMethod')
        .isIn(['card', 'mobile_money', 'cash'])
        .withMessage('Invalid payment method'),
    
    body('pickupTime')
        .optional()
        .isISO8601()
        .withMessage('Invalid pickup time format'),
    
    body('deliveryAddress')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('Delivery address must be between 5 and 200 characters'),
    
    body('specialInstructions')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Special instructions must not exceed 500 characters'),
    
    validateRequest
];

// Review validation
const validateReview = [
    body('orderId')
        .isInt({ min: 1 })
        .withMessage('Valid order ID is required'),
    
    body('mealId')
        .isInt({ min: 1 })
        .withMessage('Valid meal ID is required'),
    
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    
    body('comment')
        .optional()
        .isLength({ min: 5, max: 1000 })
        .withMessage('Comment must be between 5 and 1000 characters')
        .matches(/^[a-zA-Z0-9\s\.,!?'-]+$/)
        .withMessage('Comment contains invalid characters'),
    
    validateRequest
];

// Vendor response validation
const validateVendorResponse = [
    body('response')
        .isLength({ min: 5, max: 500 })
        .withMessage('Response must be between 5 and 500 characters')
        .matches(/^[a-zA-Z0-9\s\.,!?'-]+$/)
        .withMessage('Response contains invalid characters'),
    
    validateRequest
];

// Profile update validation
const validateProfileUpdate = [
    nameValidation,
    phoneValidation,
    
    body('businessName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),
    
    body('businessAddress')
        .optional()
        .isLength({ min: 10, max: 200 })
        .withMessage('Business address must be between 10 and 200 characters'),
    
    body('businessType')
        .optional()
        .isIn(['restaurant', 'bakery', 'cafe', 'food-truck', 'catering', 'grocery', 'other'])
        .withMessage('Invalid business type'),
    
    body('cuisineType')
        .optional()
        .isIn(['african', 'american', 'asian', 'european', 'indian', 'mediterranean', 'mexican', 'mixed'])
        .withMessage('Invalid cuisine type'),
    
    body('operatingHours')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Operating hours must not exceed 50 characters'),
    
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    
    validateRequest
];

// Password change validation
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),
    
    validateRequest
];

// Query parameter validation
const validatePaginationQuery = [
    body('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Page must be between 1 and 1000'),
    
    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    validateRequest
];

// Sanitize input data
const sanitizeInput = (req, res, next) => {
    // Remove any potentially dangerous characters
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove HTML tags and script content
                obj[key] = obj[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<[^>]*>/g, '')
                    .trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };
    
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    
    next();
};

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validatePasswordReset,
    validatePasswordUpdate,
    validateMeal,
    validateOrder,
    validateReview,
    validateVendorResponse,
    validateProfileUpdate,
    validatePasswordChange,
    validatePaginationQuery,
    sanitizeInput,
    validateRequest
};