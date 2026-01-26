require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
const sequelize = require("./config/db");

const User = require("./models/User");
const Post = require("./models/Post");

// 🔍 DEBUG: Check if imports are valid
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const postRoutes = require("./routes/postRoutes");

console.log("🛠️ Route Load Status:");
console.log("- Auth Routes:", typeof authRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");
console.log("- Admin Routes:", typeof adminRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");
console.log("- Post Routes:", typeof postRoutes === 'function' ? "✅ OK" : "❌ UNDEFINED");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const server = http.createServer(app);

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", process.env.FRONTEND_URL],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* SOCKET.IO */
const io = new Server(server, {
  cors: { origin: "*", credentials: true }
});
global.io = io;

io.on("connection", (socket) => {
  socket.on("join_room", (userId) => socket.join(`user_${userId}`));
});

/* MODEL ASSOCIATIONS */
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

/* ROUTES - Wrapped in safety checks */
if (typeof authRoutes === 'function') app.use("/api/auth", authRoutes);
if (typeof adminRoutes === 'function') app.use("/api/admin", adminRoutes);
if (typeof postRoutes === 'function') app.use("/api/posts", postRoutes);

app.get("/", (req, res) => res.send("🚀 Real Estate API Active"));

/* SERVER STARTUP */
const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: !isProd }).then(() => {
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => console.error("❌ DB Sync Error:", err.message));