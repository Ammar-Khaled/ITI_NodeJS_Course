const Joi = require('joi');

const searchPostsSchema = {
    query: Joi.object({
        q: Joi.string().min(1).max(200).required(),
        page: Joi.number().integer().min(1).optional().default(1),
        limit: Joi.number().integer().min(1).max(100).optional().default(10),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
        tags: Joi.string().optional(),
        published: Joi.boolean().optional()
    })
};

module.exports = searchPostsSchema;
