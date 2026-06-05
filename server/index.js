const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // 1. Import the auth router
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows our server to accept and parse incoming JSON payloads

// 2. Mount API Routes
app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);

app.use('/api/orders', orderRoutes);

// Basic Test Route
app.get('/', (req, res) => {
    res.send('🌾 Farmer Marketplace API is running smoothly.');
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server spinning up on port ${PORT}`);
});