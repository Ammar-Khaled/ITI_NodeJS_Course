const Joi = require('joi');

const updateCommentSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    }),
    body: Joi.object({
        content: Joi.string().min(1).max(1000).required()
    })
};

module.exports = updateCommentSchema;
