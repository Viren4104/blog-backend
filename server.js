require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
const sequelize = require("./config/db");

// Import Models for associations
const User = require("./models/User");
const Post = require("./models/Post");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const postRoutes = require("./routes/postRoutes");

// 🔍 DEBUG: Check if imports are valid to prevent "TypeError: argument handler must be a function"
console.log("🛠️ Route Load Status:");
console.log("- Auth Routes:", typeof authRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");
console.log("- Admin Routes:", typeof adminRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");
console.log("- Post Routes:", typeof postRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const server = http.createServer(app);

/* ===============================
    MIDDLEWARE & CORS FIX
================================ */
// 🚨 CRITICAL: Wildcards (*) are forbidden when 'credentials' is true. 
// We must list the origins explicitly.
const allowedOrigins = [
  "http://localhost:1212", // Your Blogging App local port
  "http://localhost:5173", // Vite default
  "http://localhost:3000", // Next.js default
  process.env.FRONTEND_URL  // Production URL (e.g., Vercel or Render)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

/* ===============================
    SOCKET.IO (Blogging Sync)
================================ */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Make 'io' global for your controllers (like when a new blog post is published)
global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 Client connected to Blog Server:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Blogger ${userId} joined their sync room`);
  });

  socket.on("disconnect", () => console.log("🔴 Client disconnected"));
});

/* ===============================
    MODEL ASSOCIATIONS
================================ */
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

/* ===============================
    ROUTES (Safe Registration)
================================ */
if (typeof authRoutes === 'function') app.use("/api/auth", authRoutes);
if (typeof adminRoutes === 'function') app.use("/api/admin", adminRoutes);
if (typeof postRoutes === 'function') app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Blogging App Backend Active and Running");
});

/* ===============================
    SERVER STARTUP
================================ */
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: !isProd }) // Keep Neon DB in sync with your models
  .then(() => {
    console.log("✅ Neon PostgreSQL Database connected");
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${isProd ? 'production' : 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });