const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token containing the user's ID
 * @param {string} id - The MongoDB User ObjectId
 * @returns {string} - Signed JWT token string
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token remains valid for 30 days
    });
};

module.exports = generateToken;