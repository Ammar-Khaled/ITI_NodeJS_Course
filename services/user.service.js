const User = require('../models/user.model');
const util = require('util');
const APIError = require('../utils/APIError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSign = util.promisify(jwt.sign);

exports.signUp = async (userData) => {
    const { email, password } = userData;
    // verfiy email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new APIError("User already exists", 400);
    }

    // extract plain password and hash it
    const hashedPassword = await bcrypt.hash(password, 12);


    // create user with hashed password
    const user = await User.create({ ...userData, password: hashedPassword });
    return user;
}


exports.signIn = async ({ email, password }) => {
    // find user by email
    const user = await User.findOne({ email }, { createdAt: 0, updatedAt: 0, __v: 0 });

    if (!user) {
        throw new APIError("Invalid email or password", 401);
    }

    // compare hashed password with the plain password
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new APIError("Invalid email or password", 401);
    }

    const payload = {
        userId: user._id,
        role: user.role
    }

    // generate token 
    const token = await jwtSign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token, user: { ...user.toObject(), password: undefined } };

}

// Get all users with pagination
exports.getAllUsers = async (page, limit) => {
    const usersPromise = User.find({}, { password: 0 })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalPromise = User.countDocuments();

    return await Promise.all([usersPromise, totalPromise]);
};

// Get user by ID
exports.getUserById = async (id) => {
    return await User.findOne({ _id: id }, { password: 0 });
};

// Update user by ID
exports.updateUser = async (id, updateData) => {
    return await User.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true }
    );
};

// Delete user by ID
exports.deleteUser = async (id) => {
    return await User.findOneAndDelete({ _id: id });
};
