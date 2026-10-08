const express = require('express');
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const optionalAuth = require('../middleware/optionalAuth');
// ASSUMPTION: Nadia's middleware/auth.js exports `protect` (sets req.user) and `requireRole(...roles)`.
const { protect, requireRole } = require('../middleware/auth');
const { RESTAURANT_STATUSES } = require('../config/constants');

const router = express.Router();

// ---------- helpers ----------
const EDITABLE = ['name', 'town', 'area', 'address', 'location', 'cuisine', 'diningType', 'priceLevel',
  'averageMealCost', 'seatsPerSlot', 'openingHours', 'description'];
// Whitelist: owners can NEVER set owner, rating, reviewCount or status through POST/PUT.
const pickEditable = (body) =>
  Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

const userId = (req) => String(req.user._id || req.user.id);
const isAdmin = (req) => req.user && req.user.role === 'admin';
const isOwnerOf = (req, restaurant) => req.user && String(restaurant.owner._id || restaurant.owner) === userId(req);

function handleError(res, err) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid value: ' + err.path });
  console.error(err);
  return res.status(500).json({ message: 'Server error' });
}

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid restaurant ID' });
  next();
}

// ---------- routes (FIXED routes first, /:id last) ----------

// GET /restaurants  - guests/travelers/owners: approved only. Admin: everything, optional ?status=pending
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filter = {};
    if (isAdmin(req)) {
      if (req.query.status) {
        if (!RESTAURANT_STATUSES.includes(req.query.status)) return res.status(400).json({ message: 'Invalid status' });
        filter.status = req.query.status;
      }
    } else {
      filter.status = 'approved';
    }
    const restaurants = await Restaurant.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
    res.status(200).json(restaurants);
  } catch (err) {
    handleError(res, err);
  }
});

// GET /restaurants/mine  - owner's own restaurants (any status)
router.get('/mine', protect, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: userId(req) }).sort({ createdAt: -1 });
    res.status(200).json(restaurants);
  } catch (err) {
    handleError(res, err);
  }
});

// POST /restaurants  - owner applies; always starts as pending
router.post('/', protect, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.create({
      ...pickEditable(req.body),
      owner: userId(req),
      status: 'pending',
    });
    res.status(201).json(restaurant);
  } catch (err) {
    handleError(res, err);
  }
});

// GET /restaurants/:id  - 400 bad id, 404 missing. Unapproved ones are visible only to their owner or an admin.
router.get('/:id', validateId, optionalAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.status !== 'approved' && !isAdmin(req) && !isOwnerOf(req, restaurant)) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.status(200).json(restaurant);
  } catch (err) {
    handleError(res, err);
  }
});

// PUT /restaurants/:id  - owner of it, or admin
router.put('/:id', validateId, protect, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (!isAdmin(req) && !isOwnerOf(req, restaurant)) {
      return res.status(403).json({ message: 'You can only edit your own restaurants' });
    }
    restaurant.set(pickEditable(req.body));
    await restaurant.save(); // save() runs the validators
    res.status(200).json(restaurant);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /restaurants/:id  - owner of it, or admin
router.delete('/:id', validateId, protect, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (!isAdmin(req) && !isOwnerOf(req, restaurant)) {
      return res.status(403).json({ message: 'You can only delete your own restaurants' });
    }
    await restaurant.deleteOne();
    res.status(200).json({ message: 'Restaurant deleted' });
  } catch (err) {
    handleError(res, err);
  }
});

// PATCH /restaurants/:id/status  - admin approves or rejects
router.patch('/:id/status', validateId, protect, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!RESTAURANT_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status must be one of: ' + RESTAURANT_STATUSES.join(', ') });
    }
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.status(200).json(restaurant);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
