const rateLimit = require('express-rate-limit');
const APIError = require('../utils/APIError');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-8', // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    ipv6Subnet: 56, // IPv6 support
    handler: (req, res, next) => {
        throw new APIError('Too many requests, please try again later.', 429);
    }
});

module.exports = rateLimiter;