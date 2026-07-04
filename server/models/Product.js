const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Every product must belong to a registered farmer
    },
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Vegetables', 'Fruits', 'Dairy', 'Grains'],
        required: [true, 'Please select a valid category']
    },
    pricePerUnit: {
        type: Number,
        required: [true, 'Please add a price']
    },
    unit: {
        type: String,
        required: [true, 'Please specify the unit (e.g., kg, liter, bunch)'],
        default: 'kg'
    },
    availabilityQuantity: {
        type: Number,
        required: [true, 'Please add available stock quantity'],
        min: [0, 'Stock cannot be negative']
    },
    harvestDate: {
        type: Date,
        required: [true, 'Please specify the harvest date']
    },
    isOrganic: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        default: '' // We will save the image cloud URL here later
    },
    averageRating: {
        type: Number,
        default: 0
    },

    reviewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);