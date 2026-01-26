// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// ✅ SESSION PACKAGES ADDED
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const sequelize = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

/* ===============================
   MIDDLEWARE & SESSIONS
================================ */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // ✅ IMPORTANT FOR SESSIONS: Allows cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ✅ SESSION CONFIGURATION
app.use(session({
  store: new pgSession({
    conObject: {
      connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      ssl: { rejectUnauthorized: false } // Required for cloud DBs
    },
    tableName: 'session' // Auto-creates a 'session' table
  }),
  secret: process.env.JWT_SECRET || 'super_secret_session_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 Day
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // true on Render
    sameSite: 'lax'
  }
}));

/* ===============================
   MODEL RELATIONSHIPS
================================ */
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

/* ===============================
   ROUTES
================================ */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Blog Backend Running! Sessions & RBAC enabled.');
});

/* ===============================
   STATIC ADMIN SEEDER
================================ */
const createDefaultAdmin = async () => {
  try {
    const staticAdmins = [
      { username: 'SuperAdmin', email: 'admin@admin.com', password: 'admin123' },
      { username: 'Viren', email: 'viren@test.com', password: 'viren_secure_password' }
    ];

    for (const adminData of staticAdmins) {
      const adminExists = await User.findOne({ where: { email: adminData.email } });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await User.create({
          username: adminData.username,
          email: adminData.email,
          password: hashedPassword,
          role: 'admin',
          can_create: true, can_edit: true, can_delete: true, can_read: true
        });
        console.log(`✅ Static Admin created: ${adminData.email}`);
      }
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
  .sync({ alter: !isProd })
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