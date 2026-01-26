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

// 🔍 DEBUG: Validates that your route files are exporting 'router' correctly
console.log("🛠️ Route Load Status:");
console.log("- Auth Routes:", typeof authRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");
console.log("- Admin Routes:", typeof adminRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");
console.log("- Post Routes:", typeof postRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const server = http.createServer(app);

/* ===============================
    CORS CONFIGURATION
================================ */
// Explicitly list origins to avoid wildcard errors when using credentials
const allowedOrigins = [
  "http://localhost:1212", // Your local Blogging App port
  "http://localhost:5173", 
  "http://localhost:3000", 
  process.env.FRONTEND_URL 
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* ===============================
    SOCKET.IO INITIALIZATION
================================ */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Make 'io' global to trigger real-time updates from your controllers
global.io = io; 

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  
  // Join a private room for targeted permission/data syncs
  socket.on("join_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room user_${userId}`);
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
// Safety checks prevent the server from crashing if a route file fails to load
if (typeof authRoutes === 'function') app.use("/api/auth", authRoutes);
if (typeof adminRoutes === 'function') app.use("/api/admin", adminRoutes);
if (typeof postRoutes === 'function') app.use("/api/posts", postRoutes);

app.get("/", (req, res) => res.send("🚀 Blogging App Backend Running"));

/* ===============================
    STARTUP & DB SYNC
================================ */
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: !isProd }).then(() => {
  console.log("✅ Neon PostgreSQL Database connected");
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${isProd ? 'production' : 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error("❌ Database connection failed:", err.message);
});