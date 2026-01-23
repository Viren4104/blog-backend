const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
require('dotenv').config();

// Models
const User = require('./models/User');
const Post = require('./models/Post');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors({
  origin: '*', // OK for now (lock later for frontend domain)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // ✅ PATCH added here!
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/* ===============================
   MODEL RELATIONSHIPS
================================ */
User.hasMany(Post, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

Post.belongsTo(User, {
  foreignKey: 'userId'
});

/* ===============================
   ROUTES
================================ */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Blog Backend Running! RBAC enabled.');
});

/* ===============================
   ADMIN SEEDER
================================ */
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@admin.com';

    const adminExists = await User.findOne({
      where: { email: adminEmail }
    });

    if (!adminExists) {
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

      console.log('✅ Default admin created');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (err) {
    console.error('❌ Admin Seeder Error:', err.message);
  }
};

/* ===============================
   SERVER + DB START
================================ */
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

sequelize
  .sync({ alter: !isProd }) // ⚠️ alter ONLY in dev
  .then(async () => {
    console.log('✅ Database synced');
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });