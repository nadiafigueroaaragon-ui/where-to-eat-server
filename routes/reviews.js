const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const { protect, requireRole } = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const updateRestaurantRating = require('../utils/updateRestaurantRating');

// populate('restaurant') needs the Restaurant model registered, so load it when this file loads.
// (The model belongs to a teammate. If the file is missing, skip it instead of crashing.)
try {
  require('../models/Restaurant');
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') throw err;
}
const router = express.Router();

// Only these fields can come from the request body (status can never be set by the traveler)
const pick = (body) => {
  const out = {};
  for (const key of ['rating', 'comment', 'visitDate']) if (body[key] !== undefined) out[key] = body[key];
  return out;
};

const RESTAURANT_FIELDS = 'name town area imageUrl';

// GET /reviews?limit=3 - public: the newest approved reviews across all restaurants (home page)
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const reviews = await Review.find({ status: 'approved' })
      .populate('restaurant', RESTAURANT_FIELDS)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json(reviews);
  } catch (err) { next(err); }
});

// GET /reviews/mine - the traveler's own reviews (every status)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('restaurant', RESTAURANT_FIELDS)
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) { next(err); }
});

// GET /reviews/owner - approved reviews written on the owner's restaurants (an admin sees all)
router.get('/owner', protect, async (req, res, next) => {
  try {
    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    const Restaurant = mongoose.models.Restaurant || require('../models/Restaurant');
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const restaurants = await Restaurant.find(filter).select('_id');
    const reviews = await Review.find({
      restaurant: { $in: restaurants.map((r) => r._id) },
      status: 'approved',
    })
      .populate('restaurant', RESTAURANT_FIELDS)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(500);
    res.status(200).json(reviews);
  } catch (err) { next(err); }
});

// GET /reviews/pending - admin moderation queue (oldest first)
router.get('/pending', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('restaurant', RESTAURANT_FIELDS)
      .populate('user', 'name')
      .sort({ createdAt: 1 });
    res.status(200).json(reviews);
  } catch (err) { next(err); }
});

// POST /reviews - write a review (always starts as pending)
router.post('/', protect, requireRole('traveler'), async (req, res, next) => {
  try {
    const { restaurant: restaurantId } = req.body;
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'A valid restaurant is required' });
    }

    const Restaurant = mongoose.models.Restaurant || require('../models/Restaurant');
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.status !== 'approved') {
      return res.status(400).json({ message: 'You can only review approved restaurants' });
    }

    if (await Review.exists({ restaurant: restaurantId, user: req.user._id })) {
      return res.status(400).json({ message: 'You already reviewed this restaurant. Edit your review instead.' });
    }

    const review = await Review.create({
      ...pick(req.body),
      restaurant: restaurantId,
      user: req.user._id,
      status: 'pending',
    });
    res.status(201).json(review);
  } catch (err) { next(err); }
});

// GET /reviews/:id - one review (its author or an admin)
router.get('/:id', protect, validateId(), async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('restaurant', RESTAURANT_FIELDS);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const isAuthor = String(review.user) === String(req.user._id);
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    res.status(200).json(review);
  } catch (err) { next(err); }
});

// PUT /reviews/:id - edit your own review. An edit goes back to pending so the admin re-checks it.
router.put('/:id', protect, validateId(), async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own review' });
    }

    const wasApproved = review.status === 'approved';
    review.set(pick(req.body));
    review.status = 'pending';
    await review.save(); // runs validators

    if (wasApproved) await updateRestaurantRating(review.restaurant); // it no longer counts
    res.status(200).json(review);
  } catch (err) { next(err); }
});

// DELETE /reviews/:id - delete your own review (an admin may also remove any review)
router.delete('/:id', protect, validateId(), async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const isAuthor = String(review.user) === String(req.user._id);
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own review' });
    }

    await review.deleteOne();
    if (review.status === 'approved') await updateRestaurantRating(review.restaurant);
    res.status(200).json({ message: 'Review deleted' });
  } catch (err) { next(err); }
});

// PATCH /reviews/:id/status - admin approves or rejects
router.patch('/:id/status', protect, requireRole('admin'), validateId(), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = status;
    await review.save();
    await updateRestaurantRating(review.restaurant);
    res.status(200).json(review);
  } catch (err) { next(err); }
});

module.exports = router;