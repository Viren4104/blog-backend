require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const sequelize = require("./config/db");
const User = require("./models/User");
const Post = require("./models/Post");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
const isProd = process.env.NODE_ENV === "production"; // ✅ Define this early

/* ===============================
   MIDDLEWARE & CORS
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:1212",
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ],
    credentials: true, // Required for sessions
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ===============================
   SESSION CONFIG
================================ */
app.use(
  session({
    store: new pgSession({
      conObject: {
        // ✅ FIX 1: Added backticks for the template literal
        connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        ssl: { rejectUnauthorized: false },
      },
      tableName: "session",
    }),
    name: "seaneb.sid",
    secret: process.env.SESSION_SECRET || "viren_rbac_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // ✅ FIX 2: Added missing '*'
      httpOnly: true,
      // ✅ FIX 3: Dynamic security settings
      secure: isProd, // Must be true on Render, false on Localhost
      sameSite: isProd ? "none" : "lax", // "none" requires "secure: true"
    },
  })
);

/* ===============================
   RELATIONSHIPS & ROUTES
================================ */
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("RBAC Backend Running with Sessions");
});

/* ===============================
   ADMIN SEEDER
================================ */
const createDefaultAdmin = async () => {
  try {
    const staticAdmins = [
      { username: "SuperAdmin", email: "admin@admin.com", password: "admin123" },
      { username: "Viren", email: "viren@test.com", password: "viren_secure_password" },
    ];

    for (const adminData of staticAdmins) {
      const adminExists = await User.findOne({ where: { email: adminData.email } });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await User.create({
          username: adminData.username,
          email: adminData.email,
          password: hashedPassword,
          role: "admin",
          can_create: true, can_edit: true, can_delete: true, can_read: true,
        });
        console.log(`✅ Static admin created: ${adminData.email}`);
      }
    }
  } catch (err) {
    console.error("❌ Admin seeder error:", err.message);
  }
};

/* ===============================
   SERVER + DB START
================================ */
const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: !isProd })
  .then(async () => {
    console.log("✅ Database connected");
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });