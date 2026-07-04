const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getHomeStats = async (req, res) => {
    try {

        const totalFarmers = await User.countDocuments({
            role: "farmer",
        });

        const totalCustomers = await User.countDocuments({
            role: "customer",
        });

        const totalProducts = await Product.countDocuments();

        const totalOrders = await Order.countDocuments({
            status: {
                $ne: "Not Selected",
            },
        });

        res.json({
            totalFarmers,
            totalCustomers,
            totalProducts,
            totalOrders,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    getHomeStats,
};