require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const http = require("http"); 
const { Server } = require("socket.io"); 

const sequelize = require("./config/db");
const User = require("./models/User");
const Post = require("./models/Post");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
const isProd = process.env.NODE_ENV === "production";

// 1. Create the HTTP server to wrap Express
const server = http.createServer(app);

/* ===============================
    MIDDLEWARE & CORS
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:1212", 
      "http://localhost:5173", 
      process.env.FRONTEND_URL, 
    ],
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ===============================
    SOCKET.IO INITIALIZATION
================================ */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:1212", "http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true
  }
});

// Make 'io' global for controllers to access
global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 Real-time client connected:", socket.id);

  // Users join a private room for targeted updates
  socket.on("join_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their private sync room`);
  });

  socket.on("disconnect", () => console.log("🔴 Client disconnected"));
});

/* ===============================
    SESSION CONFIG (NEON + PG STORE)
================================ */
app.use(
  session({
    store: new pgSession({
      conObject: {
        connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        ssl: { rejectUnauthorized: false },
      },
      tableName: "session",
    }),
    name: "seaneb.sid",
    secret: process.env.SESSION_SECRET || "viren_rbac_secret_key",
    resave: false,
    saveUninitialized: false,
    proxy: true, // 🛡️ Required for Render deployment
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, 
      httpOnly: true,
      secure: true, // 🛡️ Required for cross-site cookies on Render
      sameSite: "none", // 🛡️ Essential for localhost -> Render communication
    },
  })
);

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
  res.send("🚀 Real Estate RBAC Real-Time Backend Running");
});

/* ===============================
    STATIC ADMIN SEEDER
================================ */
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: "admin@admin.com" } });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "SuperAdmin",
        email: "admin@admin.com",
        password: hashedPassword,
        role: "admin",
        can_create: true, can_edit: true, can_delete: true, can_read: true,
      });
      console.log(`✅ Static admin created: admin@admin.com`);
    }
  } catch (err) {
    console.error("❌ Admin seeder error:", err.message);
  }
};

/* ===============================
    SERVER STARTUP
================================ */
const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: !isProd }) // Keep DB updated in dev
  .then(async () => {
    console.log("✅ Database connected");
    await createDefaultAdmin();
    // 🛡️ CRITICAL: Listen on 'server' instance
    server.listen(PORT, () => {
      console.log(`🚀 Real-time server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });