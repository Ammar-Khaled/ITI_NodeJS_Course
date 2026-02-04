const Joi = require('joi');

const schedulePostSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    }),
    body: Joi.object({
        publishedAt: Joi.date().iso().greater('now').required()
    })
};

module.exports = schedulePostSchema;
