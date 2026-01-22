const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User (Default role is 'user' via model definition)
        const newUser = await User.create({
            username, 
            email, 
            password: hashedPassword 
            // Permissions default to false (except read) automatically
        });

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
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

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

        // Send Role info so Frontend can redirect (Dashboard vs Admin Panel)
        res.json({ token, role: user.role, redirectTo: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};