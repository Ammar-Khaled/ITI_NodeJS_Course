const Joi = require('joi');

const getAllCommentsSchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        sort: Joi.string().optional(),
        postId: Joi.string().hex().length(24).optional()
    })
};

module.exports = getAllCommentsSchema;
