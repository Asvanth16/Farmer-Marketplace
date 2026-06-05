const Product = require('../models/Product');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Farmer only)
 */
const createProduct = async (req, res) => {
    try {
        const { name, category, pricePerUnit, unit, availabilityQuantity, harvestDate, isOrganic, imageUrl } = req.body;

        // Automatically assign the logged-in farmer's ID from the JWT token
        const product = await Product.create({
            farmer: req.user._id,
            name,
            category,
            pricePerUnit,
            unit,
            availabilityQuantity,
            harvestDate,
            isOrganic,
            imageUrl
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get all available products (with optional search filters)
 * @route   GET /api/products
 * @access  Public (Open to Customers & Guests)
 */
const getProducts = async (req, res) => {
    try {
        // Find all products and populate basic farmer details (name and email) from the User collection
        const products = await Product.find({})
            .populate('farmer', 'name email farmDetails');
        
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
            return res.status(404).json({ message: 'Product not found' });
        }

        // Security check: Ensure the logged-in farmer actually owns this product record
        if (product.farmer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to modify this product' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
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

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
};