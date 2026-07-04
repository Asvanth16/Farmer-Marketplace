const express = require('express');
const router = express.Router();

const {
    getDashboardStats,
    getPendingFarmers,
    approveFarmer,
    rejectFarmer,
    getAllFarmers,
    suspendFarmer,
    activateFarmer,
    getAllOrders,
    getOrderStats,
    getAllProducts,
    deleteProductByAdmin,
    getAllUsers,
    toggleUserStatus,
    getAnalytics
} = require('../controllers/adminController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

router.get(
    '/dashboard',
    protect,
    authorize('admin'),
    getDashboardStats
);

router.get(
    '/farmers/pending',
    protect,
    authorize('admin'),
    getPendingFarmers
);

router.get(
    '/orders',
    protect,
    authorize('admin'),
    getAllOrders
);

router.get(
    '/order-stats',
    protect,
    authorize('admin'),
    getOrderStats
);

router.get(
    '/products',
    protect,
    authorize('admin'),
    getAllProducts
);

router.delete(
    '/products/:id',
    protect,
    authorize('admin'),
    deleteProductByAdmin
);

router.get(
    '/users',
    protect,
    authorize('admin'),
    getAllUsers
);

router.get(
    '/analytics',
    protect,
    authorize('admin'),
    getAnalytics
);

router.put(
    '/users/:id/toggle-status',
    protect,
    authorize('admin'),
    toggleUserStatus
);

router.put(
    '/farmers/:id/approve',
    protect,
    authorize('admin'),
    approveFarmer
);

router.put(
    '/farmers/:id/reject',
    protect,
    authorize('admin'),
    rejectFarmer
);

router.get(
    '/farmers',
    protect,
    authorize('admin'),
    getAllFarmers
);

router.put(
    '/farmers/:id/suspend',
    protect,
    authorize('admin'),
    suspendFarmer
);

router.put(
    '/farmers/:id/activate',
    protect,
    authorize('admin'),
    activateFarmer
);

module.exports = router;