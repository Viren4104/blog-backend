const express = require('express');
const cors = require('cors'); 
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// 1. CORS Configuration
// This allows your frontend (localhost:1212) to talk to this backend
app.use(cors({
    origin: '*', // Allow requests from ANYWHERE (Easiest for testing)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware to parse JSON bodies
app.use(express.json());

// 3. Route Definitions
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

// 4. Default Route (Optional: Good for checking if server is live)
app.get('/', (req, res) => {
    res.send('Blog Backend is Running!');
});

// 5. Database Sync and Server Start
// NOTE: We use process.env.PORT because Render assigns a random port (e.g. 10000)
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }) // 'alter: true' updates tables if you change models
    .then(() => {
        console.log("Database connected & synced successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err.message);
    });