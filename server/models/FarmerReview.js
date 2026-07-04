const mongoose = require('mongoose');

const farmerReviewSchema = new mongoose.Schema(
{
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model(
    'FarmerReview',
    farmerReviewSchema
);