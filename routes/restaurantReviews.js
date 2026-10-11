const express = require('express');
const Review = require('../models/Review');
const validateId = require('../middleware/validateId');

const router = express.Router();

// GET /restaurants/:id/reviews - approved reviews only (public)
// Mounted at /restaurants. It has a different shape than /restaurants/:id, so order does not matter.
router.get('/:id/reviews', validateId(), async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.id, status: 'approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) { next(err); }
});

module.exports = router;
