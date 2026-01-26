const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 1. CHECK: Does this email already exist?
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User
        const newUser = await User.create({
            username, 
            email, 
            password: hashedPassword 
            // Role defaults to 'user' automatically via the Model
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
        
        // 1. Check User
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Check Password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid credentials' });

        // 3. Generate Token (Added 'expiresIn' for security)
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 1 day (Good practice)
        );

        // 4. Send Response
        res.json({ 
            token, 
            role: user.role, 
            redirectTo: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard' 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};