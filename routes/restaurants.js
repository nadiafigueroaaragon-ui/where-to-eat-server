const express = require('express');
const Restaurant = require('../models/Restaurant');
const getAvailability = require('../utils/availability');
const { isValidDate, MAX_GUESTS } = require('../utils/slots');

const router = express.Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isObjectId = (s) => /^[a-f0-9]{24}$/i.test(s);
const find = (idOrSlug) => (isObjectId(idOrSlug) ? Restaurant.findById(idOrSlug) : Restaurant.findOne({ slug: idOrSlug.toLowerCase() }));

// GET /restaurants?q=&cuisine=&area=&minRating=&experience=&sort=rating|name
router.get('/', async (req, res, next) => {
  try {
    const { q, cuisine, area, minRating, experience, sort } = req.query;
    const filter = {};
    if (q) {
      const rx = new RegExp(esc(String(q)), 'i');
      filter.$or = [{ name: rx }, { cuisine: rx }, { area: rx }, { locationNote: rx }];
    }
    if (cuisine) filter.cuisineGroup = String(cuisine);
    if (area) filter.area = new RegExp(`^${esc(String(area))}$`, 'i');
    if (experience) filter.experiences = String(experience);
    if (minRating && !Number.isNaN(Number(minRating))) filter.rating = { $gte: Number(minRating) };
    const order = sort === 'name' ? { name: 1 } : { rating: -1, name: 1 };
    res.status(200).json(await Restaurant.find(filter).populate('town', 'name province').sort(order));
  } catch (err) { next(err); }
});

// GET /restaurants/:idOrSlug/availability?date=YYYY-MM-DD&guests=2   (before /:idOrSlug)
router.get('/:idOrSlug/availability', async (req, res, next) => {
  try {
    const guests = Number(req.query.guests || 2);
    if (!isValidDate(req.query.date)) return res.status(400).json({ message: 'date must be YYYY-MM-DD' });
    if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
      return res.status(400).json({ message: `guests must be 1-${MAX_GUESTS}` });
    }
    const restaurant = await find(req.params.idOrSlug);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const slots = await getAvailability(restaurant._id, req.query.date, guests);
    res.status(200).json({ restaurant: restaurant._id, date: req.query.date, guests, slots });
  } catch (err) { next(err); }
});

// GET /restaurants/:idOrSlug
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const restaurant = await find(req.params.idOrSlug);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    await restaurant.populate('town', 'name province');
    res.status(200).json(restaurant);
  } catch (err) { next(err); }
});

module.exports = router;
