const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
require('dotenv').config();

// =======================
// MODELS
// =======================
const User = require('./models/User');
const Post = require('./models/Post');

// =======================
// ROUTES
// =======================
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// =======================
// CORS CONFIG
// =======================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());

// =======================
// DATABASE RELATIONSHIPS
// =======================
User.hasMany(Post, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
Post.belongsTo(User, {
    foreignKey: 'userId'
});

// =======================
// ROUTES
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

// =======================
// HEALTH CHECK
// =======================
app.get('/', (req, res) => {
    res.send('🚀 Blog Backend is Running! Login → admin@admin.com / admin123');
});

// =======================
// DEFAULT ADMIN SEEDER
// =======================
const createDefaultAdmin = async () => {
    try {
        const adminEmail = 'admin@admin.com';

        let admin = await User.findOne({ where: { email: adminEmail } });

        if (!admin) {
            console.log('>>> Creating Default Admin...');

            const hashedPassword = await bcrypt.hash('admin123', 10);

            await User.create({
                username: 'SuperAdmin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                can_create: true,
                can_edit: true,
                can_delete: true,
                can_read: true
            });

            console.log('>>> ADMIN CREATED → admin@admin.com / admin123');
        } else {
            // Force admin permissions (safety net)
            await admin.update({
                role: 'admin',
                can_create: true,
                can_edit: true,
                can_delete: true,
                can_read: true
            });

            console.log('>>> Admin verified & permissions synced');
        }
    } catch (err) {
        console.error('>>> Admin Seeder Error:', err.message);
    }
};

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
    .then(async () => {
        console.log('✅ Database connected & synced');

        await createDefaultAdmin();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
    });
