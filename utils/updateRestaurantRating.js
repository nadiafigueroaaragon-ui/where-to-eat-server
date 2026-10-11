const mongoose = require('mongoose');
const Review = require('../models/Review');

// Ratings are COMPUTED, never typed in. Call this whenever a review is approved, rejected,
// edited, or deleted. Only APPROVED reviews count toward a restaurant's rating.
module.exports = async function updateRestaurantRating(restaurantId) {
  const [stats] = await Review.aggregate([
    { $match: { restaurant: new mongoose.Types.ObjectId(String(restaurantId)), status: 'approved' } },
    { $group: { _id: '$restaurant', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const rating = stats ? Math.round(stats.average * 10) / 10 : 0; // one decimal, 0 when no reviews
  const reviewCount = stats ? stats.count : 0;

  // The Restaurant model belongs to a teammate; load it lazily so this file never breaks without it
  let Restaurant = mongoose.models.Restaurant;
  if (!Restaurant) {
    try {
      Restaurant = require('../models/Restaurant');
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err;
    }
  }
  if (Restaurant) await Restaurant.findByIdAndUpdate(restaurantId, { rating, reviewCount });

  return { rating, reviewCount };
};
