const express = require('express');
const router = express.Router();

const {
    handleCartSync,
    createOrder,
    getMyOrders,
    getFarmerStatsAndOrders,
    updateOrderStatus,
    cancelOrder,
    clearCart
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Customer Cart
router.post('/cart', protect, handleCartSync);
router.delete('/cart', protect, clearCart);

// Customer Checkout
router.post('/', protect, createOrder);

// Customer Order History
router.get('/myorders', protect, getMyOrders);

// Farmer Dashboard Stats + Orders
router.get(
    '/farmer-stats',
    protect,
    authorize('farmer'),
    getFarmerStatsAndOrders
);

router.put(
    '/:id/cancel',
    protect,
    cancelOrder
);

// Farmer Update Order Status
router.put(
    '/:id',
    protect,
    authorize('farmer'),
    updateOrderStatus
);

module.exports = router;