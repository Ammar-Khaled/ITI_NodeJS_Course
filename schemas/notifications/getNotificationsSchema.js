const Joi = require('joi');

const getNotificationsSchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        sort: Joi.string().optional(),
        read: Joi.string().valid('true', 'false').optional()
    })
};

module.exports = getNotificationsSchema;
