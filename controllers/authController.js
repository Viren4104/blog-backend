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
      // Default permissions for new users
      can_read: true,
      can_create: false,
      can_edit: false,
      can_delete: false
    });

    // ✅ SYNCED: Store only the ID to match your middleware
    req.session.userId = newUser.id;

    res.status(201).json({
      message: "Registered successfully",
      role: newUser.role,
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

    // ✅ SYNCED: Store the ID so 'protect' middleware can find it
    req.session.userId = user.id;

    res.json({
      message: "Logged in successfully",
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  // ✅ Correctly destroys session in PostgreSQL and clears browser cookie
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("seaneb.sid"); 
    res.json({ message: "Logged out successfully" });
  });
};