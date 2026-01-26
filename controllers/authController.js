const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      can_read: true,
      can_create: false,
      can_edit: false,
      can_delete: false
    });

    // Store the ID for the middleware
    req.session.userId = newUser.id;

    // ✅ FORCE SAVE: Ensures Neon DB is updated before the frontend gets the response
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session save failed" });
      res.status(201).json({
        message: "Registered successfully",
        role: newUser.role,
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Attach user ID to session
    req.session.userId = user.id;

    // ✅ FORCE SAVE: Critical for cross-origin setups like Render
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session login failed" });
      res.json({
        message: "Logged in successfully",
        role: user.role,
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  // Destroy session in DB and clear the cookie named in your server.js
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("seaneb.sid"); 
    res.json({ message: "Logged out successfully" });
  });
};