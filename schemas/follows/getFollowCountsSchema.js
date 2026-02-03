const Joi = require('joi');

const getFollowCountsSchema = {
    params: Joi.object({
        userId: Joi.string().hex().length(24).required()
    })
};

module.exports = getFollowCountsSchema;
