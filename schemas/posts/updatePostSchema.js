const Joi = require('joi');

const updatePostSchema = {
    body: Joi.object({
        title: Joi.string().min(3).max(200).optional(),
        content: Joi.string().min(10).optional(),
        author: Joi.string().min(2).max(100).optional(),
        tags: Joi.array().items(Joi.string()).optional(),
        published: Joi.boolean().optional()
    }),
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

module.exports = updatePostSchema;