const mongoose = require('mongoose');

const townSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Town name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Town name must be at least 2 characters'],
      maxlength: [60, 'Town name must be at most 60 characters'],
    },
    province: { type: String, default: 'Pampanga', trim: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Town', townSchema);