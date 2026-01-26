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
    });
 
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      can_read: newUser.can_read,
      can_create: newUser.can_create,
      can_edit: newUser.can_edit,
      can_delete: newUser.can_delete,
    };
 
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
 
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      can_read: user.can_read,
      can_create: user.can_create,
      can_edit: user.can_edit,
      can_delete: user.can_delete,
    };
 
    res.json({
      message: "Logged in successfully",
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("seaneb.sid");
    res.json({ message: "Logged out successfully" });
  });
};


