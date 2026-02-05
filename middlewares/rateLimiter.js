const rateLimit = require('express-rate-limit');
const APIError = require('../utils/APIError');

const createRateLimiter = (windowMs, limit, message) => {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        ipv6Subnet: 56,
        handler: (req, res, next) => {
            throw new APIError(message || 'Too many requests, please try again later.', 429);
        }
    });
};

const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5,
    'Too many authentication attempts, please try again after 15 minutes.'
);

const passwordResetLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3,
    'Too many password reset attempts, please try again after an hour.'
);

const fileUploadLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    10,
    'Too many file uploads, please try again after an hour.'
);

const generalLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100,
    'Too many requests, please try again later.'
);

module.exports = {
    authLimiter,
    passwordResetLimiter,
    generalLimiter,
    fileUploadLimiter
};
