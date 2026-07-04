const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // 1. Import the auth router
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const farmerReviewRoutes = require('./routes/farmerReviewRoutes');
const publicRoutes = require("./routes/publicRoutes");

require('./config/cloudinary');


// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL
    ],
    credentials: true
}));
app.use(express.json()); // Allows our server to accept and parse incoming JSON payloads

// 2. Mount API Routes
app.use('/api/auth', authRoutes);

app.use("/api/public", publicRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/products', productRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/users', userRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/farmer-reviews', farmerReviewRoutes);

// Basic Test Route
app.get('/', (req, res) => {
    res.send('🌾 Farmer Marketplace API is running smoothly.');
});

app.use((req, res) => {
    res.status(404).json({
        message: "API route not found"
    });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server spinning up on port ${PORT}`);
});