const express = require('express');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const S = require('../utils/slots');

const router = express.Router();
const isObjectId = (s) => typeof s === 'string' && /^[a-f0-9]{24}$/i.test(s);

// POST /reservations  (logged-in users)
router.post('/', protect, async (req, res, next) => {
  try {
    const { restaurantId, date, time, guests, contactName, contactPhone } = req.body;
    const g = Number(guests);

    if (!isObjectId(restaurantId)) return res.status(400).json({ message: 'Invalid restaurant' });
    if (!Number.isInteger(g) || g < 1 || g > S.MAX_GUESTS) return res.status(400).json({ message: `Guests must be 1-${S.MAX_GUESTS}` });
    if (!S.isValidDate(date)) return res.status(400).json({ message: 'Date must be YYYY-MM-DD' });
    if (!S.startTimes().includes(time)) return res.status(400).json({ message: 'Invalid time slot' });
    if (contactPhone && !/^[0-9+()\-\s]{7,20}$/.test(contactPhone)) return res.status(400).json({ message: 'Invalid phone number' });

    const startsAt = S.toStartsAt(date, time);
    const now = new Date();
    if (startsAt <= now) return res.status(400).json({ message: 'That time has already passed' });
    if (startsAt > S.addMinutes(now, S.MAX_ADVANCE_DAYS * 24 * 60)) {
      return res.status(400).json({ message: `Bookings open up to ${S.MAX_ADVANCE_DAYS} days ahead` });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const tables = await Table.find({ restaurant: restaurant._id, seats: { $gte: g } }).sort({ seats: 1, label: 1 });
    if (!tables.length) return res.status(400).json({ message: `No table can seat ${g} guests` });

    await Reservation.init(); // make sure the unique index exists before relying on it

    // Try the smallest suitable table first. If the unique index rejects it (someone else holds
    // an overlapping block, even a millisecond ago), fall through to the next table.
    for (const table of tables) {
      try {
        const reservation = await Reservation.create({
          user: req.user._id,
          restaurant: restaurant._id,
          table: table._id,
          date, time, startsAt,
          endsAt: S.addMinutes(startsAt, S.DURATION_MINUTES),
          guests: g,
          contactName: (contactName || req.user.name).trim(),
          contactPhone: contactPhone || '',
          slotKeys: S.keysFor(table._id, date, time),
        });
        await reservation.populate([{ path: 'restaurant', select: 'name slug' }, { path: 'table', select: 'label seats' }]);
        return res.status(201).json(reservation);
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }
    return res.status(409).json({ message: 'Sorry, that time was just taken. Please choose another time.' });
  } catch (err) { next(err); }
});

// GET /reservations/mine   (fixed route, before /:id)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const list = await Reservation.find({ user: req.user._id })
      .populate('restaurant', 'name slug image')
      .populate('table', 'label seats')
      .select('-slotKeys')
      .sort({ startsAt: -1 });
    res.status(200).json(list);
  } catch (err) { next(err); }
});

// PATCH /reservations/:id/cancel   (owner of the reservation only; frees the table)
router.patch('/:id/cancel', protect, validateId(), async (req, res, next) => {
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r || String(r.user) !== String(req.user._id)) return res.status(404).json({ message: 'Reservation not found' });
    if (r.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });
    if (r.startsAt <= new Date()) return res.status(400).json({ message: 'Past reservations cannot be cancelled' });
    r.status = 'cancelled';
    await r.save();
    res.status(200).json({ message: 'Reservation cancelled' });
  } catch (err) { next(err); }
});

module.exports = router;
