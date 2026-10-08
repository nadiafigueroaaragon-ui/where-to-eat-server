const express = require('express');
const User = require('../models/User');
const signToken = require('../utils/token');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /auth/register  (admin can never be self-registered)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (role && !['traveler', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'Role must be traveler or owner' });
    }
    const user = await User.create({ name, email, password, role: role || 'traveler' });
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me
router.get('/me', protect, (req, res) => res.status(200).json(req.user));

module.exports = router;
