const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route: Everyone should be able to view products
router.get('/', getProducts);

// Protected routes: Only authenticated users with the role 'farmer' can mutate product data
router.post('/', protect, authorize('farmer'), createProduct);
router.put('/:id', protect, authorize('farmer'), updateProduct);
router.delete('/:id', protect, authorize('farmer'), deleteProduct);

module.exports = router;