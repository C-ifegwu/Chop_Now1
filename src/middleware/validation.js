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
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
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

// Meal validation
const validateMeal = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Meal name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    
    body('originalPrice')
        .isFloat({ min: 0.01, max: 1000 })
        .withMessage('Original price must be between $0.01 and $1000'),
    
    body('discountedPrice')
        .isFloat({ min: 0.01, max: 1000 })
        .withMessage('Discounted price must be between $0.01 and $1000')
        .custom((value, { req }) => {
            if (value >= req.body.originalPrice) {
                throw new Error('Discounted price must be less than original price');
            }
            const discountPercentage = ((req.body.originalPrice - value) / req.body.originalPrice) * 100;
            if (discountPercentage < 20) {
                throw new Error('Discount must be at least 20%');
            }
            return true;
        }),
    
    body('quantityAvailable')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity available must be between 1 and 100'),
    
    body('cuisineType')
        .optional()
        .isIn(['african', 'american', 'asian', 'european', 'indian', 'mediterranean', 'mexican', 'mixed'])
        .withMessage('Invalid cuisine type'),
    
    body('mealType')
        .optional()
        .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert'])
        .withMessage('Invalid meal type'),
    
    body('dietaryRestrictions')
        .optional()
        .isJSON()
        .withMessage('Dietary restrictions must be valid JSON array'),
    
    body('allergens')
        .optional()
        .isJSON()
        .withMessage('Allergens must be valid JSON array'),
    
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