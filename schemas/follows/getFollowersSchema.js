const Joi = require('joi');

const getFollowersSchema = {
    params: Joi.object({
        userId: Joi.string().hex().length(24).required()
    }),
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('createdAt', '-createdAt').default('-createdAt')
    })
};

module.exports = getFollowersSchema;
