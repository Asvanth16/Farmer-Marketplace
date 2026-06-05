const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, farmLocation, farmingMethod, cropTypes } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email address' });
        }

        const userData = { name, email, password, role };

        if (role === 'farmer') {
            userData.farmDetails = {
                location: farmLocation,
                farmingMethod,
                cropTypes: cropTypes || [],
                isVerified: false 
            };
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                farmDetails: user.farmDetails,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data provided' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Authenticate User & Get Token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user and explicitly select the password field (since it defaults to unselected)
        const user = await User.findOne({ email }).select('+password');

        // 2. Check if user exists and the password hashes match
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                farmDetails: user.farmDetails,
                token: generateToken(user._id) // Issue a fresh token for this session
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};