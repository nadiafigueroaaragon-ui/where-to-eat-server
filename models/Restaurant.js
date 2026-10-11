const mongoose = require('mongoose');
const { TOWNS, CUISINES, DINING_TYPES, PRICE_LEVELS, RESTAURANT_STATUSES, DAYS } = require('../config/constants');

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/; // "HH:mm", 24-hour

// One day of opening hours. If close <= open, the restaurant closes AFTER midnight
// (e.g. open "18:00", close "02:00" = open until 2 AM the next day).
const timeField = (def) => ({
  type: String,
  default: def,
  validate: {
    validator(v) {
      return this.closed || TIME.test(v);
    },
    message: 'Time must be in HH:mm format',
  },
});
const daySchema = new mongoose.Schema(
  { open: timeField('09:00'), close: timeField('21:00'), closed: { type: Boolean, default: false } },
  { _id: false }
);

const openingHours = {};
DAYS.forEach((d) => {
  openingHours[d] = { type: daySchema, default: () => ({}) };
});

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    town: { type: String, required: [true, 'Town is required'], enum: { values: TOWNS, message: 'Town must be one of the four towns' } },
    area: { type: String, trim: true }, // optional label: Balibago, Clark, Friendship...
    address: { type: String, required: [true, 'Address is required'], trim: true },
    // GeoJSON so Helayn can use $near / $geoWithin for /restaurants/nearby. Order is [longitude, latitude]!
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number],
        default: undefined,
        required: [true, 'Coordinates are required'],
        validate: {
          validator: (c) => Array.isArray(c) && c.length === 2 && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
    },
    cuisine: { type: String, required: true, enum: { values: CUISINES, message: 'Invalid cuisine' } },
    diningType: { type: String, required: true, enum: { values: DINING_TYPES, message: 'Invalid dining type' } },
    priceLevel: { type: String, required: true, enum: { values: PRICE_LEVELS, message: 'Invalid price level' } },
    averageMealCost: { type: Number, required: true, min: [0, 'Average meal cost cannot be negative'] },
    seatsPerSlot: { type: Number, required: true, min: [1, 'Seats per time slot must be at least 1'] },
    openingHours,
    description: { type: String, trim: true, maxlength: 1000 },
    // Computed from APPROVED reviews only (Mhir's review code updates these). Never typed in.
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: RESTAURANT_STATUSES, default: 'pending' },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ status: 1, town: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
