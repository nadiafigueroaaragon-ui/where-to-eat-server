const mongoose = require('mongoose');
const { REVIEW_STATUSES } = require('../config/constants');

const reviewSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: [true, 'Restaurant is required'] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'User is required'] },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      validate: { validator: Number.isInteger, message: 'Rating must be a whole number from 1 to 5' },
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment must be at most 1000 characters'],
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
      validate: { validator: (d) => d <= new Date(), message: 'Visit date cannot be in the future' },
    },
    status: { type: String, enum: REVIEW_STATUSES, default: 'pending' },
  },
  { timestamps: true }
);

// One review per traveler per restaurant
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });
// Fast lookups for "approved reviews of a restaurant" and the moderation queue
reviewSchema.index({ restaurant: 1, status: 1, createdAt: -1 });

reviewSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Review', reviewSchema);
