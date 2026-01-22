const express = require('express');
const cors = require('cors'); 
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

// Load environment variables early
require('dotenv').config();

const app = express();

// 1. CORS Configuration
// This enables your frontend to communicate with the backend
app.use(cors({
    origin: '*', // Allows access from any domain (Safe for this stage)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware to parse JSON bodies
app.use(express.json());

// 3. Route Definitions
// Note: These define the paths. Your frontend MUST include '/api'
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

// 4. Default Route (Health Check)
app.get('/', (req, res) => {
    res.send('Blog Backend is Running! Use /api/auth/register to sign up.');
});

// 5. Server Start
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log("Database connected & synced successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err.message);
    });