const User = require('../models/User');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

module.exports = {
    getProfile
};