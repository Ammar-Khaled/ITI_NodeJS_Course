const Joi = require('joi');

const getUserLikesSchema = {
    params: Joi.object({
        userId: Joi.string().hex().length(24).required()
    }),
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        targetType: Joi.string().valid('Post', 'Comment').optional(),
        sort: Joi.string().valid('createdAt', '-createdAt').default('-createdAt')
    })
};

module.exports = getUserLikesSchema;
