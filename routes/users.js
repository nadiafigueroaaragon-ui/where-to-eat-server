const express = require('express');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

const router = express.Router();

// PUT /users/me  (own profile; role can never be changed here)
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = password;
    }
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// GET /users  (admin)
router.get('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

// DELETE /users/:id  (admin)
router.delete('/:id', protect, requireRole('admin'), validateId(), async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
