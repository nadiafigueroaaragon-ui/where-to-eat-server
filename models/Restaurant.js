const mongoose = require('mongoose');

const CUISINE_GROUPS = ['Kapampangan', 'Filipino', 'Japanese', 'Korean', 'Italian', 'Indian', 'Thai', 'Asian'];
const EXPERIENCES = ['date-night', 'family-dining', 'group-gatherings', 'casual-dining', 'fine-dining', 'late-night'];

const noteSchema = new mongoose.Schema(
  { text: { type: String, required: true, trim: true }, verified: { type: Boolean, default: false } },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Restaurant name is required'], trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    town: { type: mongoose.Schema.Types.ObjectId, ref: 'Town', required: true },
    area: { type: String, trim: true, default: '' },          // e.g. Clark, Infinity Mall
    locationNote: { type: String, trim: true, default: '' },  // e.g. Near the walking street
    cuisine: { type: String, required: true, trim: true },    // display text
    cuisineGroup: { type: String, enum: CUISINE_GROUPS, required: true }, // filter tiles
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    rating: { type: Number, min: 0, max: 5 },
    ratingSource: { type: String, default: 'Initial dataset (not a live rating)' },
    recommendedDishes: [{ type: String, trim: true }],
    experiences: [{ type: String, enum: EXPERIENCES }],
    notes: [noteSchema],
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

restaurantSchema.statics.CUISINE_GROUPS = CUISINE_GROUPS;
restaurantSchema.statics.EXPERIENCES = EXPERIENCES;

module.exports = mongoose.model('Restaurant', restaurantSchema);
