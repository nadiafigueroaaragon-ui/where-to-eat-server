const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    date: { type: String, required: true },   // YYYY-MM-DD (Philippine local date)
    time: { type: String, required: true },   // HH:mm start
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    contactName: { type: String, trim: true, required: true },
    contactPhone: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    slotKeys: { type: [String], required: true },
  },
  { timestamps: true }
);

// THE double-booking guard: no two CONFIRMED reservations may share any "table|date|30-min block" key.
// MongoDB enforces this atomically, so two simultaneous requests cannot both succeed.
// Cancelled reservations fall out of the index and free the table again.
reservationSchema.index({ slotKeys: 1 }, { unique: true, partialFilterExpression: { status: 'confirmed' } });
reservationSchema.index({ user: 1, startsAt: -1 });
reservationSchema.index({ restaurant: 1, date: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
