const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$')).required()
        .messages({
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number.'
        }),
    userType: Joi.string().valid('consumer', 'vendor').required(),
    phone: Joi.string().optional().allow(''),
    name: Joi.string().optional().allow(''),
    businessName: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
});

const mealSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    originalPrice: Joi.number().positive().required(),
    discountedPrice: Joi.number().positive().less(Joi.ref('originalPrice')).required(),
    quantityAvailable: Joi.number().integer().min(0).required(),
    cuisineType: Joi.string().optional().allow(''),
    allergens: Joi.string().optional().allow(''),
    pickupOptions: Joi.string().optional().allow(''),
    pickupTimes: Joi.string().optional().allow(''),
});

module.exports = {
    registerSchema,
    mealSchema
};
