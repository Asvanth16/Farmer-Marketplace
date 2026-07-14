const express = require('express');

const router = express.Router();

const {
    createFarmerReview,
    getFarmerReviews,
    getMyProfileReviews,
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
    "/my-profile",
    protect,
    getMyProfileReviews
);

router.get(
    '/:farmerId',
    getFarmerReviews
);

module.exports = router;