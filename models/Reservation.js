const mongoose = require('mongoose');
const { RESERVATION_STATUSES } = require('../config/constants');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    startsAt: { type: Date, required: true },
    guests: { type: Number, required: true, min: [1, 'At least 1 guest'] },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, trim: true, default: '' },
    status: { type: String, enum: RESERVATION_STATUSES, default: 'confirmed' },
  },
  { timestamps: true }
);
reservationSchema.index({ user: 1, startsAt: -1 });
reservationSchema.index({ restaurant: 1, date: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
