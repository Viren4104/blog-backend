const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

/* =====================
   MIDDLEWARE (TOP FIRST)
   ===================== */
app.use(cors({
    origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
    credentials: true
}));

app.use(express.json());

/* =====================
   ROUTES
   ===================== */
app.get('/', (req, res) => {
    res.send('Server is ready!');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

/* =====================
   DB SYNC & SERVER START
   ===================== */
sequelize.sync({ alter: true })
    .then(() => {
        console.log("Database connected & synced");
        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    })
    .catch(err => {
        console.error("DB connection failed:", err);
    });
