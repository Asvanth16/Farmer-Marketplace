const express = require('express');

const router = express.Router();

const {
    createReview,
    getProductReviews,
    getMyProductsReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

const {
    protect
} = require('../middleware/authMiddleware');

router.get(
    "/my-products",
    protect,
    getMyProductsReviews
);

router.get(
    '/:productId',
    getProductReviews
);

router.post(
    '/',
    protect,
    createReview
);

router.put(
    '/:id',
    protect,
    updateReview
);

router.delete(
    '/:id',
    protect,
    deleteReview
);



module.exports = router;