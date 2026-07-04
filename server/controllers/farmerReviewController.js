const FarmerReview = require('../models/FarmerReview');

const createFarmerReview = async (req, res) => {

    try {

        const {
            farmerId,
            rating,
            comment
        } = req.body;

        const existingReview =
            await FarmerReview.findOne({
                farmer: farmerId,
                customer: req.user._id
            });

        if (existingReview) {
            return res.status(400).json({
                message: 'Review already submitted'
            });
        }

        const review =
            await FarmerReview.create({
                farmer: farmerId,
                customer: req.user._id,
                rating,
                comment
            });

        res.status(201).json(review);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getFarmerReviews = async (req, res) => {

    try {

        const reviews =
            await FarmerReview.find({
                farmer: req.params.farmerId
            })
            .populate(
                'customer',
                '_id name'
            )
            .sort({
                createdAt: -1
            });

        const summary = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        reviews.forEach(review => {
            summary[review.rating]++;
        });

        const averageRating =
            reviews.length > 0
                ? (
                    reviews.reduce(
                        (sum, review) =>
                            sum + review.rating,
                        0
                    ) / reviews.length
                ).toFixed(1)
                : 0;

        res.json({
            reviews,
            averageRating,
            reviewCount:
                reviews.length,
            summary
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const updateFarmerReview = async (req, res) => {

    try {

        const review =
            await FarmerReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        if (
            review.customer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(401).json({
                message: 'Not authorized'
            });
        }

        review.rating = req.body.rating;
        review.comment = req.body.comment;

        await review.save();

        res.json(review);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const deleteFarmerReview = async (req, res) => {

    try {

        const review =
            await FarmerReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        if (
            review.customer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(401).json({
                message: 'Not authorized'
            });
        }

        await review.deleteOne();

        res.json({
            message: 'Review deleted'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


module.exports = {
    createFarmerReview,
    getFarmerReviews,
    updateFarmerReview,
    deleteFarmerReview
};