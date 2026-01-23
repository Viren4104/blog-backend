const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
require('dotenv').config();

const User = require('./models/User'); 
const Post = require('./models/Post'); 

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Relations
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
    res.send('🚀 Blog Backend Running! Admin panel active.');
});

// Admin Seeder
const createDefaultAdmin = async () => {
    try {
        const adminEmail = 'admin@admin.com';
        let admin = await User.findOne({ where: { email: adminEmail } });

        if (!admin) {
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
            console.log('>>> ADMIN CREATED');
        } else {
            console.log('>>> Admin verified');
        }
    } catch (err) {
        console.error('>>> Seeder Error:', err.message);
    }
};

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
    .then(async () => {
        console.log('✅ Database connected');
        await createDefaultAdmin();
        app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    })
    .catch(err => console.error('❌ DB Error:', err.message));