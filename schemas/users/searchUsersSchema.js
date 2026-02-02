const Joi = require('joi');

const searchUsersSchema = {
    query: Joi.object({
        q: Joi.string().min(1).max(100).required(),
        page: Joi.number().integer().min(1).optional().default(1),
        limit: Joi.number().integer().min(1).max(100).optional().default(10)
    })
};

module.exports = searchUsersSchema;
