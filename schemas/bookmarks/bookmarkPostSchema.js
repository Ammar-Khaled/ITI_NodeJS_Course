const Joi = require('joi');

const bookmarkPostSchema = {
    params: Joi.object({
        postId: Joi.string().hex().length(24).required()
    })
};

module.exports = bookmarkPostSchema;
