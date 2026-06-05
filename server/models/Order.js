const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // The consumer placing the order
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            priceAtPurchase: {
                type: Number,
                required: true // Captured at purchase so future price edits by farmers won't alter past receipts
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    deliverySlot: {
        type: String,
        required: [true, 'Please select a delivery slot']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Dispatched', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);