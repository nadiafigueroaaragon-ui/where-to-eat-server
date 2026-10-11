// Booking rules live here so routes and seeders share ONE definition.
// NOTE: OPEN_MIN/CLOSE_MIN are the app's *booking window*, NOT verified restaurant opening hours.
const SLOT_MINUTES = 30;      // grid size for start times
const DURATION_MINUTES = 90;  // every reservation holds its table for 90 minutes
const OPEN_MIN = 11 * 60;     // first bookable start: 11:00
const CLOSE_MIN = 22 * 60;    // a reservation must END by 22:00 (last start 20:30)
const MAX_GUESTS = 10;
const MAX_ADVANCE_DAYS = 60;
const TZ_OFFSET = '+08:00';   // Philippines

const pad = (n) => String(n).padStart(2, '0');
const toHHmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

function startTimes() {
  const out = [];
  for (let m = OPEN_MIN; m + DURATION_MINUTES <= CLOSE_MIN; m += SLOT_MINUTES) out.push(toHHmm(m));
  return out;
}

// One key per 30-min block the reservation occupies, e.g. "<tableId>|2026-10-20|19:00".
// A unique index on these keys is what makes double booking impossible at the DB level.
function keysFor(tableId, date, time) {
  const start = toMinutes(time);
  const keys = [];
  for (let m = start; m < start + DURATION_MINUTES; m += SLOT_MINUTES) keys.push(`${tableId}|${date}|${toHHmm(m)}`);
  return keys;
}

function isValidDate(d) {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
}

const toStartsAt = (date, time) => new Date(`${date}T${time}:00${TZ_OFFSET}`);
const addMinutes = (d, mins) => new Date(d.getTime() + mins * 60000);

module.exports = { SLOT_MINUTES, DURATION_MINUTES, MAX_GUESTS, MAX_ADVANCE_DAYS, startTimes, keysFor, isValidDate, toStartsAt, addMinutes };
