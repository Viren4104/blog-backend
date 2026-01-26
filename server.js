require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
const sequelize = require("./config/db");

// Import Models
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
const allowedOrigins = [
  "http://localhost:1212", // Your local Blogging App port
  "http://localhost:5173", 
  "http://localhost:3000", 
  process.env.FRONTEND_URL 
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps) or matching origins
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

global.io = io; // Access 'io' in controllers for real-time updates

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  socket.on("join_room", (userId) => socket.join(`user_${userId}`));
});

/* ===============================
    MODEL ASSOCIATIONS
================================ */
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

/* ===============================
    ROUTES
================================ */
if (typeof authRoutes === 'function') app.use("/api/auth", authRoutes);
if (typeof adminRoutes === 'function') app.use("/api/admin", adminRoutes);
if (typeof postRoutes === 'function') app.use("/api/posts", postRoutes);

app.get("/", (req, res) => res.send("🚀 Blog Backend Running"));

/* ===============================
    STARTUP
================================ */
const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: !isProd }).then(() => {
  server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
}).catch(err => console.error("❌ DB Error:", err.message));