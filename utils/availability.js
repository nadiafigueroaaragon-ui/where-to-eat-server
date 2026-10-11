const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const { startTimes, keysFor, toStartsAt } = require('./slots');

// Returns [{ time, available }] for one restaurant/date/party size.
// Informational only: POST /reservations re-checks atomically before confirming.
module.exports = async function getAvailability(restaurantId, date, guests) {
  const [tables, reservations] = await Promise.all([
    Table.find({ restaurant: restaurantId, seats: { $gte: guests } }).select('_id'),
    Reservation.find({ restaurant: restaurantId, date, status: 'confirmed' }).select('slotKeys'),
  ]);
  const taken = new Set(reservations.flatMap((r) => r.slotKeys));
  const now = new Date();
  return startTimes().map((time) => {
    const future = toStartsAt(date, time) > now;
    const free = tables.some((t) => keysFor(t._id, date, time).every((k) => !taken.has(k)));
    return { time, available: future && free };
  });
};
