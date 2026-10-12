// Booking rules in ONE place. Built on the team's Restaurant model: openingHours per weekday
// (open/close/closed, close <= open means "closes after midnight") and seatsPerSlot (capacity).
const { TIMEZONE } = require('../config/constants');

const SLOT_MINUTES = 60;      // start times are on a 1-hour grid inside the day's opening hours
const MAX_GUESTS = 12;        // matches the party-size picker in QuickReservation
const MAX_ADVANCE_DAYS = 60;
const TZ_OFFSET = '+08:00';   // Asia/Manila (no daylight saving)

const pad = (n) => String(n).padStart(2, '0');
const toHHmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

function isValidDate(d) {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
}

function dayName(date) {
  const d = new Date(`${date}T12:00:00${TZ_OFFSET}`);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: TIMEZONE }).format(d).toLowerCase();
}

// Bookable start times for a restaurant on a date (service date = the day whose hours apply).
// Each reservation occupies exactly ONE slot; seatsPerSlot caps total guests in that slot.
function slotsFor(restaurant, date) {
  const h = restaurant.openingHours && restaurant.openingHours[dayName(date)];
  if (!h || h.closed) return [];
  const open = toMinutes(h.open);
  let close = toMinutes(h.close);
  if (close <= open) close += 1440; // closes after midnight
  const out = [];
  for (let m = open; m + SLOT_MINUTES <= close; m += SLOT_MINUTES) out.push({ time: toHHmm(m % 1440), minutes: m });
  return out;
}

const startsAt = (date, minutes) => new Date(new Date(`${date}T00:00:00${TZ_OFFSET}`).getTime() + minutes * 60000);

module.exports = { SLOT_MINUTES, MAX_GUESTS, MAX_ADVANCE_DAYS, isValidDate, dayName, slotsFor, startsAt };
