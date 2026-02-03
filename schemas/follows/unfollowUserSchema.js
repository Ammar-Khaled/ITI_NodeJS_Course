const Joi = require('joi');

const unfollowUserSchema = {
    params: Joi.object({
        userId: Joi.string().hex().length(24).required()
    })
};

module.exports = unfollowUserSchema;
