const mongoose = require('mongoose');

// One document per restaurant + date + start time, counting guests already booked.
// The unique index plus an atomic conditional $inc (see routes/reservations.js) is what stops
// two simultaneous requests from overbooking a slot beyond seatsPerSlot.
const slotUsageSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  date: { type: String, required: true },   // YYYY-MM-DD (service date, Philippine time)
  time: { type: String, required: true },   // HH:mm start
  booked: { type: Number, default: 0, min: 0 },
});
slotUsageSchema.index({ restaurant: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('SlotUsage', slotUsageSchema);
