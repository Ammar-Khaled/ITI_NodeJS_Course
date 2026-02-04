const Joi = require('joi');

const deleteNotificationSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

module.exports = deleteNotificationSchema;
