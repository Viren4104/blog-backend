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

const app = express();
const isProd = process.env.NODE_ENV === "production";

// 1. Create the HTTP server to wrap Express (Required for Socket.io)
const server = http.createServer(app);

/* ===============================
    MIDDLEWARE & CORS
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite default
      "http://localhost:3000", // Next.js default
      process.env.FRONTEND_URL, // Render/Vercel Production URL
    ],
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // CRITICAL for JWT Bearer tokens
  })
);

app.use(express.json());

/* ===============================
    SOCKET.IO INITIALIZATION
================================ */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true
  }
});

// Make 'io' global so your adminController can emit updates
global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 Real-time client connected:", socket.id);

  // Users join a private room based on their ID for targeted permission syncs
  socket.on("join_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their private sync room`);
  });

  socket.on("disconnect", () => console.log("🔴 Client disconnected"));
});

/* ===============================
    MODEL ASSOCIATIONS
================================ */
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

/* ===============================
    ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Real Estate RBAC Real-Time Backend Running on Render");
});

/* ===============================
    SERVER STARTUP
================================ */
const PORT = process.env.PORT || 5000;

// Sync database and start the server
sequelize
  .sync({ alter: !isProd }) // Automatically updates Neon DB schema in development
  .then(() => {
    console.log("✅ Neon PostgreSQL Database connected");
    
    // IMPORTANT: We listen on the 'server' instance, not 'app'
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${isProd ? 'production' : 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });