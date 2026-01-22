const express = require('express');
const cors = require('cors'); 
const bcrypt = require('bcryptjs'); 
const sequelize = require('./config/db');

// --- IMPORTS: MODELS ---
const User = require('./models/User'); 
const Post = require('./models/Post'); // <--- ADDED THIS

// --- IMPORTS: ROUTES ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

require('dotenv').config();

const app = express();

// 1. CORS Configuration
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware
app.use(express.json());

// ============================================
//  DEFINE RELATIONSHIPS (Added This Block)
// ============================================
// This tells the DB that a User "owns" Posts
User.hasMany(Post, { onDelete: 'CASCADE' });
Post.belongsTo(User);
// ============================================

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

// 4. Default Route
app.get('/', (req, res) => {
    res.send('Blog Backend is Running! Login with admin@admin.com / admin123');
});

// --- MAGIC ADMIN CREATOR ---
// This function runs automatically to ensure an Admin always exists
const createDefaultAdmin = async () => {
    try {
        const adminEmail = 'admin@admin.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            console.log(">>> Creating Default Admin Account...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                username: 'SuperAdmin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin', // Forces Admin Role
                can_create: true, can_edit: true, can_delete: true, can_read: true
            });
            console.log(">>> SUCCESS: Login with admin@admin.com / admin123");
        } else {
            // If admin exists, force their role to be 'admin' just in case
            if (existingAdmin.role !== 'admin') {
                await existingAdmin.update({ role: 'admin', can_create: true, can_delete: true });
                console.log(">>> FIXED: admin@admin.com role updated to ADMIN.");
            }
        }
    } catch (error) {
        console.error(">>> Admin Seed Error:", error.message);
    }
};
// ---------------------------

// 5. Server Start
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }) 
    .then(async () => {
        console.log("Database connected & synced successfully.");
        
        // Run the Magic Admin Creator
        await createDefaultAdmin(); 

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err.message);
    });

