const express = require('express');

const router = express.Router();

const {
    createFarmerReview,
    getFarmerReviews,
    updateFarmerReview,
    deleteFarmerReview
} = require(
    '../controllers/farmerReviewController'
);

const {
    protect
} = require(
    '../middleware/authMiddleware'
);

router.post(
    '/',
    protect,
    createFarmerReview
);

router.put(
    '/:id',
    protect,
    updateFarmerReview
);

router.delete(
    '/:id',
    protect,
    deleteFarmerReview
);

router.get(
    '/:farmerId',
    getFarmerReviews
);

module.exports = router;