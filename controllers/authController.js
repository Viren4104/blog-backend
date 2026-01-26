const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER - Successfully creates user in Neon DB
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user' 
    });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// 2. LOGIN - Issues JWT for localStorage
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        can_edit: user.can_edit,
        can_create: user.can_create 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// 3. LOGOUT - Simple acknowledgment for client-side cleanup
exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully. Please clear your token on the client side." });
};