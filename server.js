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

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* ======================
   MODEL RELATIONS
====================== */
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

/* ======================
   ROUTES
====================== */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  res.send('🚀 RBAC Backend Running');
});

/* ======================
   DEFAULT ADMIN SEED
====================== */
const createDefaultAdmin = async () => {
  try {
    const email = 'admin@admin.com';

    const exists = await User.findOne({ where: { email } });
    if (!exists) {
      const hash = await bcrypt.hash('admin123', 10);

      await User.create({
        username: 'SuperAdmin',
        email,
        password: hash,
        role: 'admin',
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_read: true
      });

      console.log('✅ Default Admin Created');
    }
  } catch (err) {
    console.error('Seeder error:', err.message);
  }
};

/* ======================
   SERVER START
====================== */
const PORT = process.env.PORT || 3000;

sequelize.sync()
  .then(async () => {
    console.log('✅ DB Connected');
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  })
  .catch(err => console.error(err));
