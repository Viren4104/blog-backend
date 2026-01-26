// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// SESSION & DB PACKAGES
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
  // ✅ IMPORTANT: Use your actual frontend URL (e.g., http://localhost:5173)
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true, // Required for session cookies to work
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// SESSION CONFIGURATION (Saves sessions in PostgreSQL)
app.use(session({
  store: new pgSession({
    conObject: {
      connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      ssl: { rejectUnauthorized: false } // Required for cloud databases like Neon
    },
    tableName: 'session' // Auto-creates a 'session' table
  }),
  secret: process.env.SESSION_SECRET || 'viren_rbac_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 Day expiration
    httpOnly: true, // Protects against XSS
    secure: process.env.NODE_ENV === 'production', // true on Render/HTTPS
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
  res.send('🚀 RBAC Backend Running! Sessions & PostgreSQL enabled.');
});

/* ===============================
   STATIC ADMIN SEEDER
================================ */
const createDefaultAdmin = async () => {
  try {
    // Define your fixed, static admins here
    const staticAdmins = [
      { username: 'SuperAdmin', email: 'admin@admin.com', password: 'admin123' },
     
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
          can_create: true, 
          can_edit: true, 
          can_delete: true, 
          can_read: true
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
  .sync({ alter: !isProd }) // Only alters DB schema in development
  .then(async () => {
    console.log('✅ Database connected & synced');
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });