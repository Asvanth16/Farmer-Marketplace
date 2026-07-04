const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
    createProduct,
    getProducts,
    getProductById,
    getFarmerInventory,
    getFarmerProfile,
    updateProduct,
    deleteProduct,
    getFarmerStats,
    getRelatedProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route: Everyone should be able to view products
router.get('/', getProducts);

// Protected routes: Only authenticated users with the role 'farmer' can access these
// Note: Placed ABOVE /:id so Express doesn't mistake 'my-inventory' or 'farmer-stats' for a product ID parameter
router.get('/my-inventory', protect, authorize('farmer'), getFarmerInventory); 
router.get('/farmer-stats', protect, authorize('farmer'), getFarmerStats); // 👈 Securely registered stats endpoint

router.post('/', protect, authorize('farmer'), upload.single('image'), createProduct);
router.get('/farmer-profile/:id', getFarmerProfile);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, authorize('farmer'),upload.single('image'), updateProduct);
router.delete('/:id', protect, authorize('farmer'), deleteProduct);

module.exports = router;