const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Create a new order & update product stock quantities
 * @route   POST /api/orders
 * @access  Private (Customer/User only)
 */
const createOrder = async (req, res) => {
    try {
        const { items, deliverySlot } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items provided for this order' });
        }

        let totalAmount = 0;
        const processedItems = [];

        // 1. Validate items, check stock levels, and calculate totals
        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product not found with ID: ${item.product}` });
            }

            // Verify available stock quantity
            if (product.availabilityQuantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${product.name}. Available: ${product.availabilityQuantity}, Requested: ${item.quantity}` 
                });
            }

            // Deduct inventory stock from product schema record
            product.availabilityQuantity -= item.quantity;
            await product.save();

            // Track item transactional snapshot details
            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase: product.pricePerUnit
            });

            totalAmount += product.pricePerUnit * item.quantity;
        }

        // 2. Create the order record
        const order = await Order.create({
            customer: req.user._id, // Gathered securely from your JWT middleware
            items: processedItems,
            totalAmount,
            deliverySlot
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
    try {
        // Find orders belonging to the logged-in user
        const orders = await Order.find({ customer: req.user._id })
            .populate('items.product', 'name category unit imageUrl');
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders
};