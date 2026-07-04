const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // 👈 Imported Middleware

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Session Route
router.get('/me', protect, getCurrentUser); // 👈 Added Endpoint

module.exports = router;