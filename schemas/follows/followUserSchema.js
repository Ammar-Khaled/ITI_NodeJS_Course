const Joi = require('joi');

const followUserSchema = {
    params: Joi.object({
        userId: Joi.string().hex().length(24).required()
    })
};

module.exports = followUserSchema;
