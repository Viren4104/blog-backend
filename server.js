const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // (Implement similar to others)
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

// Sync DB and Start
sequelize.sync({ alter: true }).then(() => {
    console.log("Database connected & synced");
    app.listen(3000, () => console.log("Server running on port 3000"));
});
app.get('/', (req, res) => {
  res.send('Server is ready!');
});