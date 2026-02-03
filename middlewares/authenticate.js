const jwt = require('jsonwebtoken');
const util = require('util');
const APIError = require('../utils/APIError');

const jwtVerify = util.promisify(jwt.verify);

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        const decodedData = await jwtVerify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decodedData.userId,
            role: decodedData.role
        };

        next();
    } catch (error) {
        console.error("❌❌ error in authenticate middleware", error.message);
        throw new APIError("Unauthorized", 401);
    }
}

const optionalAuthenticate = async (req, res, next) => {
    try {
        await authenticate(req, res, () => { });
        // If authenticate succeeds, req.user is set
        next();
    } catch (error) {
        // If authenticate fails, continue without user
        req.user = null;
        next();
    }
};


module.exports = { authenticate, optionalAuthenticate };