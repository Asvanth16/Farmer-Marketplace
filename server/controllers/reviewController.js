const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

const createReview = async (req, res) => {
    try {

        const { productId, rating, comment } = req.body;

        const deliveredOrder = await Order.findOne({
            customer: req.user._id,
            status: 'Delivered',
            'items.product': productId
        });

        if (!deliveredOrder) {
            return res.status(400).json({
                message: 'You can only review purchased products'
            });
        }

        const alreadyReviewed = await Review.findOne({
            product: productId,
            customer: req.user._id
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                message: 'Review already submitted'
            });
        }

        const review = await Review.create({
            product: productId,
            customer: req.user._id,
            rating,
            comment
        });

        const reviews = await Review.find({
            product: productId
        });

        const avg =
            reviews.reduce(
                (sum, item) => sum + item.rating,
                0
            ) / reviews.length;

        await Product.findByIdAndUpdate(
            productId,
            {
                averageRating: avg,
                reviewCount: reviews.length
            }
        );

        res.status(201).json(review);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getProductReviews = async (req, res) => {

    try {

        const reviews = await Review.find({
            product: req.params.productId
        })
            .populate('customer', '_id name')
            .sort({ createdAt: -1 });

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
                        (sum, review) => sum + review.rating,
                        0
                    ) / reviews.length
                ).toFixed(1)
                : 0;

        res.json({
            reviews,
            averageRating,
            reviewCount: reviews.length,
            summary
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteReview = async (req, res) => {
    try {

        const review = await Review.findById(req.params.id);

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

        const productId = review.product;

        await review.deleteOne();

        const reviews = await Review.find({
            product: productId
        });

        const avg =
            reviews.length > 0
                ? reviews.reduce(
                    (sum, item) => sum + item.rating,
                    0
                ) / reviews.length
                : 0;

        await Product.findByIdAndUpdate(
            productId,
            {
                averageRating: avg,
                reviewCount: reviews.length
            }
        );

        res.json({
            message: 'Review deleted'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
const updateReview = async (req, res) => {

    try {

        const review =
            await Review.findById(req.params.id);

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

        review.rating =
            req.body.rating;

        review.comment =
            req.body.comment;

        await review.save();

        const reviews =
            await Review.find({
                product: review.product
            });

        const avg =
            reviews.reduce(
                (sum, r) =>
                    sum + r.rating,
                0
            ) / reviews.length;

        await Product.findByIdAndUpdate(
            review.product,
            {
                averageRating: avg,
                reviewCount: reviews.length
            }
        );

        res.json(review);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview
};