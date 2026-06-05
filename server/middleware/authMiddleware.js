const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes by validating the incoming Bearer JWT token
 */
const protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from string: "Bearer <token_value>"
            token = req.headers.authorization.split(' ')[1];

            // Verify the token signature using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from database using decoded ID and attach to request object (without password)
            req.user = await User.findById(decoded.id);

            return next(); // Pass control to the next operational function
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token validation failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no session token found' });
    }
};

/**
 * Restricts route access to specific defined user roles (e.g., 'farmer', 'admin')
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: User role '${req.user?.role || 'Guest'}' is not permitted to access this resource` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };