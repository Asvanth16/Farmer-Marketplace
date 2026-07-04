const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getDashboardStats = async (req, res) => {

    try {

        const totalFarmers =
            await User.countDocuments({
                role: 'farmer'
            });

        const totalCustomers =
            await User.countDocuments({
                role: 'customer'
            });

        const totalProducts =
            await Product.countDocuments();

        const totalOrders =
            await Order.countDocuments();

        const pendingFarmers =
            await User.countDocuments({
                role: 'farmer',
                'farmDetails.isVerified': false
            });

        res.json({
            totalFarmers,
            totalCustomers,
            totalProducts,
            totalOrders,
            pendingFarmers
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getPendingFarmers = async (req, res) => {

    try {

        const farmers =
            await User.find({
                role: 'farmer',
                'farmDetails.isVerified': false
            })
                .select('-password');

        res.json(farmers);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const approveFarmer = async (req, res) => {

    try {

        const farmer =
            await User.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({
                message: 'Farmer not found'
            });
        }

        farmer.farmDetails.isVerified = true;

        await farmer.save();

        res.json({
            message: 'Farmer approved'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const rejectFarmer = async (req, res) => {

    try {

        const farmer =
            await User.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({
                message: 'Farmer not found'
            });
        }

        farmer.farmDetails.isVerified = false;

        await farmer.save();

        res.json({
            message: 'Farmer marked unverified'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getAllFarmers = async (req, res) => {

    try {

        const farmers = await User.find({
            role: 'farmer'
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(farmers);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const suspendFarmer = async (req, res) => {

    try {

        const farmer =
            await User.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({
                message: 'Farmer not found'
            });
        }

        farmer.status = 'suspended';

        await farmer.save();

        res.json({
            message: 'Farmer suspended'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const activateFarmer = async (req, res) => {

    try {

        const farmer =
            await User.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({
                message: 'Farmer not found'
            });
        }

        farmer.status = 'active';

        await farmer.save();

        res.json({
            message: 'Farmer activated'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const getAllOrders = async (req, res) => {

    try {

        const orders = await Order.find({})
            .populate(
                'customer',
                'name email'
            )
            .populate(
                'items.product',
                'name imageUrl'
            )
            .sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const getOrderStats = async (req, res) => {

    try {

        const pending =
            await Order.countDocuments({
                status: 'Pending'
            });

        const accepted =
            await Order.countDocuments({
                status: 'Accepted'
            });

        const dispatched =
            await Order.countDocuments({
                status: 'Dispatched'
            });

        const delivered =
            await Order.countDocuments({
                status: 'Delivered'
            });

        const cancelled =
            await Order.countDocuments({
                status: 'Cancelled'
            });

        res.json({
            pending,
            accepted,
            dispatched,
            delivered,
            cancelled
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const getAllProducts = async (req, res) => {

    try {

        const products = await Product.find({})
            .populate(
                'farmer',
                'name email'
            )
            .sort({ createdAt: -1 });

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const deleteProductByAdmin = async (
    req,
    res
) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            );

        if (!product) {
            return res.status(404).json({
                message:
                    'Product not found'
            });
        }

        await product.deleteOne();

        res.json({
            message:
                'Product deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getAllUsers = async (req, res) => {

    try {

        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const toggleUserStatus = async (req, res) => {

    try {

        const user = await User.findById(
            req.params.id
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.status =
            user.status === 'suspended'
                ? 'active'
                : 'suspended';

        await user.save();

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const getAnalytics = async (req, res) => {

    try {

        const deliveredOrders =
            await Order.find({
                status: 'Delivered'
            })
                .populate('items.product');

        // Marketplace Sales

        const totalSales =
            deliveredOrders.reduce(
                (sum, order) =>
                    sum + order.totalAmount,
                0
            );

        const today = new Date();

        const startOfToday =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

        const startOfWeek =
            new Date();

        startOfWeek.setDate(
            today.getDate() - 7
        );

        const startOfMonth =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

        const todaySales =
            deliveredOrders
                .filter(
                    order =>
                        order.createdAt >= startOfToday
                )
                .reduce(
                    (sum, order) =>
                        sum + order.totalAmount,
                    0
                );

        const weekSales =
            deliveredOrders
                .filter(
                    order =>
                        order.createdAt >= startOfWeek
                )
                .reduce(
                    (sum, order) =>
                        sum + order.totalAmount,
                    0
                );

        const monthSales =
            deliveredOrders
                .filter(
                    order =>
                        order.createdAt >= startOfMonth
                )
                .reduce(
                    (sum, order) =>
                        sum + order.totalAmount,
                    0
                );
        const productMap = {};

        deliveredOrders.forEach(order => {

            order.items.forEach(item => {

                const name =
                    item.product?.name;

                if (!name) return;

                if (!productMap[name]) {

                    productMap[name] = 0;

                }

                productMap[name] += item.quantity;

            });

        });

        const topProducts =
            Object.entries(productMap)
                .map(([name, quantity]) => ({
                    name,
                    quantity
                }))
                .sort(
                    (a, b) =>
                        b.quantity - a.quantity
                )
                .slice(0, 5);
        const farmerMap = {};

        for (const order of deliveredOrders) {

            const farmerIds =
                new Set();

            order.items.forEach(item => {

                if (
                    item.product?.farmer
                ) {
                    farmerIds.add(
                        item.product.farmer.toString()
                    );
                }

            });

            farmerIds.forEach(id => {

                farmerMap[id] =
                    (farmerMap[id] || 0) + 1;

            });

        }
        const topFarmers =
            await Promise.all(

                Object.entries(farmerMap)
                    .sort(
                        (a, b) =>
                            b[1] - a[1]
                    )
                    .slice(0, 5)
                    .map(async ([id, orders]) => {

                        const farmer =
                            await User.findById(id);

                        return {
                            name:
                                farmer?.name ||
                                'Unknown',
                            orders
                        };

                    })

            );
        const categoryMap = {};

        deliveredOrders.forEach(order => {

            order.items.forEach(item => {

                const category =
                    item.product?.category;

                if (!category) return;

                categoryMap[category] =
                    (categoryMap[category] || 0) + 1;

            });

        });

        const topCategories =
            Object.entries(categoryMap)
                .map(([name, count]) => ({
                    name,
                    count
                }))
                .sort(
                    (a, b) =>
                        b.count - a.count
                )
                .slice(0, 5);
        const pendingOrders =
            await Order.countDocuments({
                status: 'Pending'
            });

        const acceptedOrders =
            await Order.countDocuments({
                status: 'Accepted'
            });

        const dispatchedOrders =
            await Order.countDocuments({
                status: 'Dispatched'
            });

        const deliveredOrdersCount =
            await Order.countDocuments({
                status: 'Delivered'
            });

        const cancelledOrders =
            await Order.countDocuments({
                status: 'Cancelled'
            });

        const rejectedOrders =
            await Order.countDocuments({
                status: 'Rejected'
            });

        const orderStatusData = [
            {
                name: 'Pending',
                value: pendingOrders
            },
            {
                name: 'Accepted',
                value: acceptedOrders
            },
            {
                name: 'Dispatched',
                value: dispatchedOrders
            },
            {
                name: 'Delivered',
                value: deliveredOrdersCount
            },
            {
                name: 'Cancelled',
                value: cancelledOrders
            },
            {
                name: 'Rejected',
                value: rejectedOrders
            }
        ];
        const salesTrend = [];

        for (let i = 6; i >= 0; i--) {

            const date = new Date();

            date.setDate(
                date.getDate() - i
            );

            const start =
                new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                );

            const end =
                new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate() + 1
                );

            const daySales =
                deliveredOrders
                    .filter(
                        order =>
                            order.createdAt >= start &&
                            order.createdAt < end
                    )
                    .reduce(
                        (sum, order) =>
                            sum + order.totalAmount,
                        0
                    );

            salesTrend.push({
                day: date.toLocaleDateString(
                    'en-US',
                    {
                        weekday: 'short'
                    }
                ),
                sales: daySales
            });

        }
        res.json({
            totalSales,
            todaySales,
            weekSales,
            monthSales,

            salesTrend,
            orderStatusData,

            topProducts,
            topFarmers,
            topCategories
        });
    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




module.exports = {
    getDashboardStats,
    getPendingFarmers,
    approveFarmer,
    rejectFarmer,
    getAllFarmers,
    suspendFarmer,
    activateFarmer,
    getAllOrders,
    getOrderStats,
    getAllProducts,
    deleteProductByAdmin,
    getAllUsers,
    toggleUserStatus,
    getAnalytics
};