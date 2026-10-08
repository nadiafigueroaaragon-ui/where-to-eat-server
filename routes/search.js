const express = require('express');
const Restaurant = require('../models/Restaurant');
const router = express.Router();

// GET /restaurants/search?town=&area=&cuisine=&diningType=&priceLevel=&minRating=&maxPrice=&sort=rating|reviews|price
router.get('/search', async (req, res, next) => {
  try {
    const { town, area, cuisine, diningType, priceLevel, minRating, maxPrice, sort } = req.query;
    const filter = { status: 'approved' };

    if (town) filter.town = town;
    if (area) filter.area = area;
    if (cuisine) filter.cuisine = cuisine;
    if (diningType) filter.diningType = diningType;
    if (priceLevel) filter.priceLevel = priceLevel;
    if (minRating !== undefined) {
      if (Number.isNaN(Number(minRating))) return res.status(400).json({ message: 'minRating must be a number' });
      filter.rating = { $gte: Number(minRating) };
    }
    if (maxPrice !== undefined) {
      if (Number.isNaN(Number(maxPrice))) return res.status(400).json({ message: 'maxPrice must be a number' });
      filter.averageMealCost = { $lte: Number(maxPrice) };
    }

    const sorts = {
      rating: { rating: -1, reviewCount: -1 },
      reviews: { reviewCount: -1 },
      price: { averageMealCost: 1 },
    };
    const results = await Restaurant.find(filter).sort(sorts[sort] || sorts.rating);
    res.status(200).json(results);
  } catch (err) { next(err); }
});

module.exports = router;