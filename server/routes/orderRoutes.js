const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Secure all order routes via authentication check middleware
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);

module.exports = router;