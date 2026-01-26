// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username, email, password: hashedPassword
        });

        // ✅ NEW: Log user in immediately upon registration
        req.session.userId = newUser.id;

        res.status(201).json({ message: 'Registered successfully', role: newUser.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid credentials' });

        // ✅ NEW: Create the Session
        req.session.userId = user.id;

        res.json({ 
            message: 'Logged in successfully',
            role: user.role, 
            redirectTo: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard' 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ NEW: Logout Controller
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Could not log out.' });
        res.clearCookie('connect.sid'); // Clears the browser cookie
        res.json({ message: 'Logged out successfully' });
    });
};