const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ msg: 'User created' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Logout is handled client-side by deleting the token

module.exports = router;