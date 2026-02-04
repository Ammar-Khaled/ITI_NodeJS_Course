const Joi = require('joi');

const createPostSchema = {
    body: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        content: Joi.string().min(10).required(),
        tags: Joi.array().items(Joi.string()).optional(),
        status: Joi.string().valid('draft', 'scheduled', 'published').optional().default('draft'),
        publishedAt: Joi.date().iso().optional().when('status', {
            is: 'scheduled',
            then: Joi.date().iso().greater('now').required(),
            otherwise: Joi.forbidden()
        }),
        likes: Joi.number().min(0).optional().default(0)
    })
};

module.exports = createPostSchema;