const Joi = require('joi');

const changePasswordBody = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(30).required(),
});

const changePasswordSchema = {
    body: changePasswordBody,
};

module.exports = changePasswordSchema;
