const Joi = require('joi');

const getUserBookmarksSchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('createdAt', '-createdAt')
    })
};

module.exports = getUserBookmarksSchema;
