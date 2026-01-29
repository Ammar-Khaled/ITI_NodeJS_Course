const Joi = require('joi');


const createCommentSchema = {
    body: Joi.object({
        content: Joi.string().min(1).max(1000).required(),
        postId: Joi.string().hex().length(24).required(),
        parentCommentId: Joi.string().hex().length(24).optional().allow(null)
    })
};

module.exports = createCommentSchema;
