const express = require('express');
const Restaurant = require('../models/Restaurant');
const router = express.Router();
const { PRICE_LEVELS, DAYS, TIMEZONE } = require('../config/constants');
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
        const { lat, lng, cuisine, diningType, priceLevel, minRating } = req.query;
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
        const filter = {
      status: 'approved',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lo, la] }, // [longitude, latitude]
          $maxDistance: minutes * WALK_METERS_PER_MIN,
        },
      },
    };
    if (cuisine) filter.cuisine = cuisine;
    if (diningType) filter.diningType = diningType;
    if (priceLevel) filter.priceLevel = priceLevel;
    if (minRating !== undefined) {
      if (Number.isNaN(Number(minRating))) return res.status(400).json({ message: 'minRating must be a number' });
      filter.rating = { $gte: Number(minRating) };
    }

    const found = await Restaurant.find(filter).lean();

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

// GET /restaurants/top-rated?town=&lat=&lng=   (all optional)
// Best-match score (0-100) = 50% rating + 25% reviews + 15% price + 10% distance
router.get('/top-rated', async (req, res, next) => {
  try {
    const { town, lat, lng } = req.query;
    const hasPoint = lat !== undefined && lng !== undefined;
    const la = Number(lat), lo = Number(lng);
    if (hasPoint && (Number.isNaN(la) || Number.isNaN(lo))) {
      return res.status(400).json({ message: 'lat and lng must be numbers' });
    }

    const filter = { status: 'approved' };
    if (town) filter.town = town;
    const all = await Restaurant.find(filter).lean();

    const scored = all.map((r) => {
      const ratingPart = (r.rating || 0) / 5;
      const reviewPart = Math.min((r.reviewCount || 0) / 50, 1); // 50 or more reviews = full marks
      const priceIndex = PRICE_LEVELS.indexOf(r.priceLevel);
      const pricePart = priceIndex < 0 ? 0.5 : 1 - priceIndex / (PRICE_LEVELS.length - 1); // cheaper scores higher

      let distancePart = 0.5; // neutral when the traveler's location is unknown
      let meters;
      if (hasPoint) {
        const [rLng, rLat] = r.location.coordinates;
        meters = distanceMeters(la, lo, rLat, rLng);
        distancePart = Math.max(0, 1 - meters / 5000); // 0 m = full marks, 5 km or more = 0
      }

      const score = 0.5 * ratingPart + 0.25 * reviewPart + 0.15 * pricePart + 0.1 * distancePart;
      return {
        ...r,
        matchScore: Math.round(score * 100),
        ...(meters !== undefined && { distanceMeters: Math.round(meters) }),
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json(scored);
  } catch (err) { next(err); }
});

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Current day name (spelled like DAYS) and minutes since midnight, in Philippine time
function manilaClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return { day: get('weekday').toLowerCase(), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

// Is a restaurant open right now? Handles closed days and places that close after midnight
function isOpenNow(hours) {
  const now = manilaClock();
  const yesterday = DAYS[(DAYS.indexOf(now.day) + 6) % 7];
  const today = hours?.[now.day];
  const before = hours?.[yesterday];

  if (today && !today.closed) {
    const open = toMin(today.open), close = toMin(today.close);
    // normal hours, or hours that run past midnight (close is earlier than open)
    if (close > open ? now.minutes >= open && now.minutes < close : now.minutes >= open) return true;
  }
  if (before && !before.closed) {
    const open = toMin(before.open), close = toMin(before.close);
    // yesterday's late night is still running (for example, open until 1 AM)
    if (close <= open && now.minutes < close) return true;
  }
  return false;
}

// GET /restaurants/open-now?town=
router.get('/open-now', async (req, res, next) => {
  try {
    const filter = { status: 'approved' };
    if (req.query.town) filter.town = req.query.town;
    const all = await Restaurant.find(filter).lean();
    const open = all.filter((r) => isOpenNow(r.openingHours)).map((r) => ({ ...r, openNow: true }));
    res.status(200).json(open);
  } catch (err) { next(err); }
});

module.exports = router;