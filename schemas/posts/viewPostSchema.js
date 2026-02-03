const Joi = require('joi');

const viewPostSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

module.exports = viewPostSchema;
