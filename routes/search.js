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

const WALK_METERS_PER_MIN = 80;

// Distance between two points on Earth, in meters (haversine formula)
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// GET /restaurants/nearby?lat=&lng=&minutes=10
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const minutes = req.query.minutes === undefined ? 10 : Number(req.query.minutes);
    const la = Number(lat), lo = Number(lng);

    if (lat === undefined || lng === undefined || Number.isNaN(la) || Number.isNaN(lo)) {
      return res.status(400).json({ message: 'lat and lng are required numbers' });
    }
    if (Math.abs(la) > 90 || Math.abs(lo) > 180) {
      return res.status(400).json({ message: 'lat or lng is out of range' });
    }
    if (Number.isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ message: 'minutes must be a positive number' });
    }

    // $near uses Andi's 2dsphere index and returns the closest restaurants first
    const found = await Restaurant.find({
      status: 'approved',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lo, la] }, // [longitude, latitude]
          $maxDistance: minutes * WALK_METERS_PER_MIN,
        },
      },
    }).lean();

    const results = found.map((r) => {
      const [rLng, rLat] = r.location.coordinates;
      const meters = Math.round(distanceMeters(la, lo, rLat, rLng));
      return {
        ...r,
        distanceMeters: meters,
        walkMinutes: Math.max(1, Math.ceil(meters / WALK_METERS_PER_MIN)),
      };
    });
    res.status(200).json(results);
  } catch (err) { next(err); }
});

module.exports = router;