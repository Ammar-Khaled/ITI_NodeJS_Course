const Joi = require('joi');

const createPostSchema = {
    body: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        content: Joi.string().min(10).required(),
        author: Joi.string().min(2).max(100).required(),
        tags: Joi.array().items(Joi.string()).optional(),
        published: Joi.boolean().optional().default(false),
        likes: Joi.number().min(0).optional().default(0)
    })
};

module.exports = createPostSchema;