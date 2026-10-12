const express = require('express');
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation');
const SlotUsage = require('../models/SlotUsage');
const { protect } = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const B = require('../utils/bookingSlots');

const router = express.Router();
const ACTIVE = ['pending', 'confirmed'];

// Atomically claim `guests` seats in one slot. Returns true only if they fit within seatsPerSlot.
// The filter only matches while booked <= capacity - guests; the unique index turns "slot exists
// but is full" (or a racing first insert) into E11000, which we resolve with a non-upsert retry.
async function claimSeats(restaurantId, date, time, guests, capacity) {
  const filter = { restaurant: restaurantId, date, time, booked: { $lte: capacity - guests } };
  const update = { $inc: { booked: guests } };
  try {
    await SlotUsage.findOneAndUpdate(filter, update, { upsert: true, new: true });
    return true;
  } catch (err) {
    if (err.code !== 11000) throw err;
    const doc = await SlotUsage.findOneAndUpdate(filter, update, { new: true });
    return !!doc; // null => the slot exists and is full
  }
}
const releaseSeats = (r) =>
  SlotUsage.updateOne({ restaurant: r.restaurant, date: r.date, time: r.time }, { $inc: { booked: -r.guests } });

// GET /reservations/availability/:restaurantId?date=YYYY-MM-DD&guests=2   (fixed route, before /:id)
router.get('/availability/:restaurantId', validateId('restaurantId'), async (req, res, next) => {
  try {
    const guests = Number(req.query.guests || 2);
    const { date } = req.query;
    if (!B.isValidDate(date)) return res.status(400).json({ message: 'date must be YYYY-MM-DD' });
    if (!Number.isInteger(guests) || guests < 1 || guests > B.MAX_GUESTS) {
      return res.status(400).json({ message: `guests must be 1-${B.MAX_GUESTS}` });
    }
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant || restaurant.status !== 'approved') return res.status(404).json({ message: 'Restaurant not found' });

    const slots = B.slotsFor(restaurant, date);
    const usage = await SlotUsage.find({ restaurant: restaurant._id, date });
    const used = new Map(usage.map((u) => [u.time, u.booked]));
    const now = new Date();
    res.status(200).json({
      restaurant: restaurant._id, date, guests, seatsPerSlot: restaurant.seatsPerSlot, closed: slots.length === 0,
      slots: slots.map((s) => {
        const seatsLeft = Math.max(0, restaurant.seatsPerSlot - (used.get(s.time) || 0));
        return { time: s.time, seatsLeft, available: B.startsAt(date, s.minutes) > now && seatsLeft >= guests };
      }),
    });
  } catch (err) { next(err); }
});

// POST /reservations   { restaurantId, date, time, guests, contactName?, contactPhone? }
router.post('/', protect, async (req, res, next) => {
  try {
    const { restaurantId, date, time, contactName, contactPhone } = req.body;
    const guests = Number(req.body.guests);

    if (!mongoose.isValidObjectId(restaurantId)) return res.status(400).json({ message: 'Invalid restaurant' });
    if (!Number.isInteger(guests) || guests < 1 || guests > B.MAX_GUESTS) return res.status(400).json({ message: `Guests must be 1-${B.MAX_GUESTS}` });
    if (!B.isValidDate(date)) return res.status(400).json({ message: 'Date must be YYYY-MM-DD' });
    if (contactPhone && !/^[0-9+()\-\s]{7,20}$/.test(contactPhone)) return res.status(400).json({ message: 'Invalid phone number' });

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.status !== 'approved') return res.status(404).json({ message: 'Restaurant not found' });

    const slot = B.slotsFor(restaurant, date).find((s) => s.time === time);
    if (!slot) return res.status(400).json({ message: 'That time is not available for this restaurant on that date' });
    if (guests > restaurant.seatsPerSlot) return res.status(400).json({ message: `This restaurant seats at most ${restaurant.seatsPerSlot} guests per time slot` });

    const startsAt = B.startsAt(date, slot.minutes);
    const now = new Date();
    if (startsAt <= now) return res.status(400).json({ message: 'That time has already passed' });
    if (startsAt.getTime() > now.getTime() + B.MAX_ADVANCE_DAYS * 86400000) {
      return res.status(400).json({ message: `Bookings open up to ${B.MAX_ADVANCE_DAYS} days ahead` });
    }

    await SlotUsage.init(); // make sure the unique index exists before relying on it
    const claimed = await claimSeats(restaurant._id, date, time, guests, restaurant.seatsPerSlot);
    if (!claimed) return res.status(409).json({ message: 'Sorry, that time slot is now full. Please choose another time.' });

    try {
      const reservation = await Reservation.create({
        user: req.user._id, restaurant: restaurant._id, date, time, startsAt, guests,
        contactName: (contactName || req.user.name).trim(), contactPhone: contactPhone || '', status: 'confirmed',
      });
      await reservation.populate('restaurant', 'name town area');
      return res.status(201).json(reservation);
    } catch (err) {
      await releaseSeats({ restaurant: restaurant._id, date, time, guests }); // undo the claim; nothing was saved
      throw err;
    }
  } catch (err) { next(err); }
});

// GET /reservations/mine
router.get('/mine', protect, async (req, res, next) => {
  try {
    const list = await Reservation.find({ user: req.user._id })
      .populate('restaurant', 'name town area imageUrl')
      .sort({ startsAt: -1 });
    res.status(200).json(list);
  } catch (err) { next(err); }
});

// GET /reservations/owner - bookings made at the owner's restaurants (an admin sees every restaurant)
router.get('/owner', protect, async (req, res, next) => {
  try {
    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const restaurants = await Restaurant.find(filter).select('_id');
    const list = await Reservation.find({ restaurant: { $in: restaurants.map((r) => r._id) } })
      .populate('restaurant', 'name town area')
      .sort({ startsAt: -1 })
      .limit(500);
    res.status(200).json(list);
  } catch (err) { next(err); }
});

// PATCH /reservations/:id/cancel  (own reservation; frees the seats exactly once)
router.patch('/:id/cancel', protect, validateId(), async (req, res, next) => {
  try {
    const r = await Reservation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: { $in: ACTIVE }, startsAt: { $gt: new Date() } },
      { status: 'cancelled' },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: 'Reservation not found, already cancelled, or already past' });
    await releaseSeats(r);
    res.status(200).json(r);
  } catch (err) { next(err); }
});

module.exports = router;