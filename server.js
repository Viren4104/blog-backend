// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const sequelize = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

/* ======================
   MIDDLEWARE & SESSIONS
====================== */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // IMPORTANT: Allows cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

app.use(express.json());

// ✅ NEW: SESSION CONFIGURATION
app.use(session({
  store: new pgSession({
    conObject: {
      connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      ssl: { rejectUnauthorized: false } // Required for cloud DBs like Neon/Render
    },
    tableName: 'session' // Will auto-create a 'session' table in DB
  }),
  secret: process.env.JWT_SECRET || 'super_secret_session_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 Day
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // true on Render, false on localhost
    sameSite: 'lax'
  }
}));

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

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log('✅ DB Connected');
  app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
}).catch(err => console.error(err));