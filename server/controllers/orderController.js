const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * @desc    Add or update items inside the customer's pending order (Cart session)
 * @route   POST /api/orders/cart
 * @access  Private (Customer only)
 */
const handleCartSync = async (req, res) => {
    try {
        const { productId, quantity, priceAtPurchase } = req.body;
        const customerId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found in marketplace' });
        }

        let order = await Order.findOne({
            customer: customerId,
            deliverySlot: 'Not Selected'
        });

        if (order) {
            const itemIndex = order.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                const targetQuantity = order.items[itemIndex].quantity + quantity;

                if (targetQuantity <= 0) {
                    order.items.splice(itemIndex, 1);
                } else {
                    if (targetQuantity > product.availabilityQuantity) {
                        return res.status(400).json({
                            message: `Only ${product.availabilityQuantity} units available. Cannot add more.`
                        });
                    }
                    order.items[itemIndex].quantity = targetQuantity;
                    order.items[itemIndex].priceAtPurchase = priceAtPurchase;
                }
            } else {
                if (quantity <= 0) {
                    return res.status(400).json({ message: 'Quantity must be greater than zero.' });
                }
                if (quantity > product.availabilityQuantity) {
                    return res.status(400).json({ message: `Only ${product.availabilityQuantity} units available.` });
                }
                order.items.push({ product: productId, quantity, priceAtPurchase });
            }
        } else {
            if (quantity <= 0) {
                return res.status(400).json({ message: 'Quantity must be greater than zero.' });
            }
            if (quantity > product.availabilityQuantity) {
                return res.status(400).json({ message: `Insufficient stock available.` });
            }

            order = new Order({
                customer: customerId,
                items: [{ product: productId, quantity, priceAtPurchase }],
                deliverySlot: 'Not Selected',
                totalAmount: 0
            });
        }

        if (order.items.length === 0) {
            await Order.deleteOne({ _id: order._id });
            return res.status(200).json({ message: 'Cart cleared successfully', items: [], totalAmount: 0 });
        }

        order.totalAmount = order.items.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0);

        await order.save();
        await order.populate('items.product', 'name category unit imageUrl');

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error handling cart sync', error: error.message });
    }
};

/**
 * @desc    Create a new order & update product stock quantities (Direct Checkout)
 * @route   POST /api/orders
 * @access  Private (Customer/User only)
 */
const createOrder = async (req, res) => {
    try {
        const { items, deliverySlot, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items provided for this order' });
        }

        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product not found with ID: ${item.product}` });
            }

            if (product.availabilityQuantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.availabilityQuantity}, Requested: ${item.quantity}`
                });
            }
            if (!shippingAddress) {
                return res.status(400).json({
                    message: 'Shipping address is required'
                });
            }

            product.availabilityQuantity -= item.quantity;
            await product.save();

            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase: product.pricePerUnit
            });

            totalAmount += product.pricePerUnit * item.quantity;
        }
        const user = await User.findById(req.user._id);

        if (shippingAddress) {
            user.address = shippingAddress;
            await user.save();
        }

        await Order.deleteOne({
            customer: req.user._id,
            deliverySlot: 'Not Selected'
        });

        const order = await Order.create({
            customer: req.user._id,
            items: processedItems,
            totalAmount,
            deliverySlot,
            shippingAddress,
            status: 'Pending'
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
        const orders = await Order.find({ customer: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name category unit imageUrl farmer',
                populate: {
                    path: 'farmer',
                    select: 'name'
                }
            });

        res.json(orders);
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Get dynamic live stats and received orders for the logged-in farmer (Real Data)
 * @route   GET /api/products/farmer-stats
 * @access  Private (Farmer only)
 */
const getFarmerStatsAndOrders = async (req, res) => {
    try {
        const farmerId = req.user._id;

        // 1. Fetch all completed/placed orders (exclude customer raw cart 'Pending' sessions)
        const allOrders = await Order.find({})
            .populate('customer', 'name email')
            .populate({
                path: 'items.product',
                select: 'name category pricePerUnit unit farmer imageUrl'
            });

        const cropVolumeMap = {};

        const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const realRevenueMap = {};

        // Initialize the last 7 days with 0 revenue
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            realRevenueMap[weekdayNames[d.getDay()]] = 0;
        }

        const receivedOrders = [];

        allOrders.forEach(order => {
            let farmerOrderTotal = 0;
            let hasFarmerProducts = false;

            const farmerItems = [];

            order.items.forEach(item => {

                if (
                    item.product &&
                    item.product.farmer &&
                    item.product.farmer.toString() === farmerId.toString()
                ) {
                    hasFarmerProducts = true;

                    const orderItemPrice =
                        item.priceAtPurchase ||
                        item.product.pricePerUnit ||
                        0;

                    const itemEarnings =
                        item.quantity * orderItemPrice;

                    farmerOrderTotal += itemEarnings;

                    // Revenue Graph
                    if (order.createdAt) {
                        const orderDay =
                            weekdayNames[
                            new Date(order.createdAt).getDay()
                            ];

                        if (
                            realRevenueMap[orderDay] !== undefined
                        ) {
                            realRevenueMap[orderDay] += itemEarnings;
                        }
                    }

                    // Top Crops
                    const cropName =
                        item.product.name || 'Unknown Crop';

                    cropVolumeMap[cropName] =
                        (cropVolumeMap[cropName] || 0) +
                        item.quantity;

                    farmerItems.push({
                        product: item.product,
                        quantity: item.quantity,
                        unit: item.product.unit,
                        priceAtPurchase: orderItemPrice
                    });
                }
            });

            if (hasFarmerProducts) {
                receivedOrders.push({
                    _id: order._id,

                    buyerName: order.customer
                        ? order.customer.name
                        : 'Retail Buyer',

                    totalPrice: farmerOrderTotal,

                    status: order.status,

                    createdAt: order.createdAt,

                    deliverySlot: order.deliverySlot,

                    shippingAddress:
                        order.shippingAddress,

                    items: farmerItems
                });
            }
        });
        const revenueData = Object.keys(realRevenueMap).map(day => ({
            day: day,
            revenue: realRevenueMap[day]
        }));

        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
        const topCropsData = Object.keys(cropVolumeMap).map((name, index) => ({
            name: name,
            value: cropVolumeMap[name],
            color: colors[index % colors.length]
        }));

        res.status(200).json({
            revenueData,
            topCropsData,
            orders: receivedOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error building real farmer metrics', error: error.message });
    }
};

/**
 * @desc    Update order status by farmer
 * @route   PUT /api/orders/:id
 * @access  Private (Farmer only)
 */
const updateOrderStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const order = await Order.findById(
            req.params.id
        );

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        const currentStatus =
            order.status;

        let allowed = false;

        if (
            currentStatus === 'Pending' &&
            (
                status === 'Accepted' ||
                status === 'Rejected'
            )
        ) {
            allowed = true;
        }

        if (
            currentStatus === 'Accepted' &&
            status === 'Dispatched'
        ) {
            allowed = true;
        }

        if (
            currentStatus === 'Dispatched' &&
            status === 'Delivered'
        ) {
            allowed = true;
        }

        if (!allowed) {
            return res.status(400).json({
                message:
                    `Cannot change ${currentStatus} to ${status}`
            });
        }
        if (status === 'Rejected') {

            for (const item of order.items) {

                const product =
                    await Product.findById(
                        item.product
                    );

                if (product) {

                    product.availabilityQuantity +=
                        item.quantity;

                    await product.save();
                }
            }
        }
        order.status = status;

        await order.save();

        res.status(200).json(order);

    } catch (error) {

        res.status(500).json({
            message:
                'Server Error updating order',
            error: error.message
        });

    }
};
const cancelOrder = async (
    req,
    res
) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            );

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        if (
            order.customer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(401).json({
                message: 'Not authorized'
            });
        }

        if (
            order.status !== 'Pending' &&
            order.status !== 'Accepted'
        ) {
            return res.status(400).json({
                message:
                    'Order can no longer be cancelled'
            });
        }
        for (const item of order.items) {

            const product =
                await Product.findById(
                    item.product
                );

            if (product) {

                product.availabilityQuantity +=
                    item.quantity;

                await product.save();
            }
        }
        order.status = 'Cancelled';

        await order.save();

        res.json({
            message:
                'Order cancelled successfully'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const clearCart = async (req, res) => {
    try {
        await Order.deleteOne({
            customer: req.user._id,
            deliverySlot: 'Not Selected'
        });

        res.json({
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    handleCartSync,
    createOrder,
    getMyOrders,
    getFarmerStatsAndOrders,
    updateOrderStatus,
    cancelOrder,
    clearCart
};