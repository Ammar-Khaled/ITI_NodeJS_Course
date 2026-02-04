const Joi = require('joi');

const removeBookmarkSchema = {
    params: Joi.object({
        postId: Joi.string().hex().length(24).required()
    })
};

module.exports = removeBookmarkSchema;
