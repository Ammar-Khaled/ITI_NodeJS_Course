const Joi = require('joi');

const checkLikedSchema = {
    query: Joi.object({
        targetType: Joi.string().valid('Post', 'Comment').required(),
        targetId: Joi.string().hex().length(24).required()
    })
};

module.exports = checkLikedSchema;
