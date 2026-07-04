const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Farmer only)
 */
const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            pricePerUnit,
            unit,
            availabilityQuantity,
            harvestDate,
            isOrganic
        } = req.body;

        const validatedHarvestDate =
            harvestDate && harvestDate.trim() !== ''
                ? new Date(harvestDate)
                : new Date();

        // Cloudinary image URL
        const imageUrl = req.file ? req.file.path : '';

        const product = await Product.create({
            farmer: req.user._id,
            name,
            category,
            pricePerUnit,
            unit: unit || 'kg',
            availabilityQuantity,
            harvestDate: validatedHarvestDate,
            isOrganic,
            imageUrl
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Get all available products (with optional search filters)
 * @route   GET /api/products
 * @access  Public (Open to Customers & Guests)
 */
const getProducts = async (req, res) => {
    try {

        const demoFarmer = await User.findOne({
            email: "farmer@demo.com"
        });

        let query = {};

        if (
            demoFarmer &&
            req.query.demoFarmer !== "true"
        ) {
            query = {
                farmer: { $ne: demoFarmer._id }
            };
        }

        const products = await Product.find(query)
            .populate("farmer", "name email farmDetails");

        res.json(products);

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id)
            .populate(
                'farmer',
                'name email farmDetails'
            );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const farmerProducts = await Product.find({
            farmer: product.farmer._id
        });

        const totalProducts = farmerProducts.length;

        const uniqueCategories = [
            ...new Set(
                farmerProducts.map(item => item.category)
            )
        ];

        res.json({
            ...product.toObject(),
            farmerStats: {
                totalProducts,
                totalCategories: uniqueCategories.length
            }
        });

    } catch (error) {

        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });

    }
};

const getFarmerProfile = async (req, res) => {
    try {

        const farmer = await User.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({
                message: 'Farmer not found'
            });
        }

        const products = await Product.find({
            farmer: farmer._id
        }).sort({ createdAt: -1 });

        const totalReviewCount = products.reduce(
            (sum, product) =>
                sum + (product.reviewCount || 0),
            0
        );

        const weightedRatingSum = products.reduce(
            (sum, product) =>
                sum +
                ((product.averageRating || 0) *
                    (product.reviewCount || 0)),
            0
        );

        const averageProductRating =
            totalReviewCount > 0
                ? (
                    weightedRatingSum /
                    totalReviewCount
                ).toFixed(1)
                : 0;

        const categories = [
            ...new Set(
                products.map(p => p.category)
            )
        ];

        const orders = await Order.find({
            status: {
                $in: [
                    'Accepted',
                    'Dispatched',
                    'Delivered'
                ]
            }
        }).populate({
            path: 'items.product',
            match: {
                farmer: farmer._id
            },
            select: 'name'
        });
        let totalOrders = 0;
        let totalSales = 0;

        const salesMap = {};

        orders.forEach(order => {

            let containsFarmerProduct = false;

            order.items.forEach(item => {

                if (item.product) {

                    containsFarmerProduct = true;

                    totalSales += item.quantity;

                    const productName =
                        item.product.name;

                    if (!salesMap[productName]) {
                        salesMap[productName] = 0;
                    }

                    salesMap[productName] += item.quantity;
                }
            });

            if (containsFarmerProduct) {
                totalOrders++;
            }

        });

        orders.forEach(order => {

            order.items.forEach(item => {

                if (item.product) {

                    totalSales += item.quantity;

                    const productName =
                        item.product.name;

                    if (!salesMap[productName]) {

                        salesMap[productName] = 0;

                    }

                    salesMap[productName] += item.quantity;

                }

            });

        });
        const topSellingProducts =
            Object.entries(salesMap)
                .map(([name, quantity]) => ({
                    name,
                    quantity,

                    percentage:
                        totalSales > 0
                            ? Math.round(
                                (quantity / totalSales) * 100
                            )
                            : 0
                }))
                .sort(
                    (a, b) =>
                        b.quantity - a.quantity
                )
                .slice(0, 5);

        res.json({
            farmer,
            products,
            stats: {
                totalProducts: products.length,

                totalCategories:
                    categories.length,

                totalOrders,
                totalSales,
                averageProductRating,
                totalReviewCount,

                topSellingProducts
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

/**
 * @desc    Get all inventory listings belonging exclusively to the logged-in farmer
 * @route   GET /api/products/my-inventory
 * @access  Private (Farmer only)
 */
const getFarmerInventory = async (req, res) => {
    try {
        // Query the database matching the user ID attached by your protect middleware
        const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Update a specific product
 * @route   PUT /api/products/:id
 * @access  Private (Farmer only)
 */
const updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        if (
            product.farmer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(401).json({
                message: 'Not authorized to modify this product'
            });
        }

        const updateData = {
            ...req.body
        };

        // Remove image
        if (req.body.removeImage === 'true') {
            updateData.imageUrl = '';
        }

        // Replace image
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        res.json(product);

    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Delete a specific product
 * @route   DELETE /api/products/:id
 * @access  Private (Farmer only)
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Security check: Ensure the logged-in farmer actually owns this product record
        if (product.farmer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();
        res.json({ message: 'Product successfully removed from marketplace' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get Farmer Dashboard Analytics (Revenue & Top Yields)
 * @route   GET /api/products/farmer-stats
 * @access  Private (Farmer only)
 */
const getFarmerStats = async (req, res) => {
    try {
        const farmerId = req.user._id;

        // 1. Fetch all orders that are not cancelled
        const orders = await Order.find({ status: { $ne: 'Cancelled' } })
            .populate({
                path: 'items.product',
                match: { farmer: farmerId }, // Isolate line items belonging to this farmer
                select: 'name category'
            });

        // 2. Setup tracking maps for chart processing
        const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const revenueMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const cropVolumeMap = {};

        // 3. Process database arrays into aggregate weights
        orders.forEach(order => {
            const orderDay = weekdayNames[new Date(order.createdAt).getDay()];

            order.items.forEach(item => {
                // Mongoose population match filter leaves item.product null if it's someone else's item
                if (item.product) {
                    const lineRevenue = item.priceAtPurchase * item.quantity;
                    const cropName = item.product.name;

                    // Aggregate day value
                    if (revenueMap[orderDay] !== undefined) {
                        revenueMap[orderDay] += lineRevenue;
                    }

                    // Aggregate product volume value
                    if (!cropVolumeMap[cropName]) {
                        cropVolumeMap[cropName] = {
                            name: cropName,
                            value: 0
                        };
                    }
                    cropVolumeMap[cropName].value += item.quantity;
                }
            });
        });

        // Format daily revenue map into an array structure for Recharts AreaChart
        const revenueData = Object.keys(revenueMap).map(day => ({
            day,
            revenue: revenueMap[day]
        }));

        // Sort performance crop dictionary by total item volume sold and cap at top 4 records
        const topCropsData = Object.values(cropVolumeMap)
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);

        // Assign a responsive hex styling palette for your BarChart
        const colorPalette = ['#f97316', '#eab308', '#06b6d4', '#ef4444'];
        topCropsData.forEach((crop, idx) => {
            crop.color = colorPalette[idx] || '#10b981';
        });

        res.status(200).json({ revenueData, topCropsData });
    } catch (error) {
        res.status(500).json({ message: 'Server Error processing operational statistics', error: error.message });
    }
};

const getRelatedProducts = async (req, res) => {
    try {

        const currentProduct =
            await Product.findById(req.params.id);

        if (!currentProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const demoFarmer = await User.findOne({
            email: "farmer@demo.com"
        });

        const hiddenFarmerId = demoFarmer?._id;

        let relatedProducts =
            await Product.find({

                farmer: { $ne: hiddenFarmerId },

                _id: { $ne: currentProduct._id },

                name: {
                    $regex: currentProduct.name,
                    $options: "i"
                }
            })
                .populate('farmer', 'name')
                .limit(4);

        if (relatedProducts.length < 4) {

            const categoryProducts =
                await Product.find({

                    farmer: { $ne: hiddenFarmerId },

                    _id: {
                        $nin: [
                            currentProduct._id,
                            ...relatedProducts.map(p => p._id)
                        ]
                    },

                    category: currentProduct.category
                })
                    .populate('farmer', 'name')
                    .limit(4 - relatedProducts.length);

            relatedProducts = [
                ...relatedProducts,
                ...categoryProducts
            ];
        }

        res.json(relatedProducts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getFarmerInventory,
    getFarmerProfile,
    updateProduct,
    deleteProduct,
    getFarmerStats,
    getRelatedProducts
};