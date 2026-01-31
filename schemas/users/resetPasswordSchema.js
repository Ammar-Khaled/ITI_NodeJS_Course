const Joi = require('joi');

const resetPasswordBody = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(30).required(),
});

const resetPasswordSchema = {
    body: resetPasswordBody,
};

module.exports = resetPasswordSchema;
