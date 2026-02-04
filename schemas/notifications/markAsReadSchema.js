const Joi = require('joi');

const markAsReadSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

module.exports = markAsReadSchema;
