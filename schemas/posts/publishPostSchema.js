const Joi = require('joi');

const publishPostSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

module.exports = publishPostSchema;
