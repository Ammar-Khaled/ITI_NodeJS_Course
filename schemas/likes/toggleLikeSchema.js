const Joi = require('joi');

const toggleLikeSchema = {
    body: Joi.object({
        targetType: Joi.string().valid('Post', 'Comment').required(),
        targetId: Joi.string().hex().length(24).required()
    })
};

module.exports = toggleLikeSchema;
