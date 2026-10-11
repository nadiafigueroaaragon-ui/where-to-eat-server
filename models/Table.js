const mongoose = require('mongoose');

// Table inventory: each restaurant has N tables with a seat count. Reservations claim a specific table.
const tableSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    label: { type: String, required: true, trim: true },
    seats: { type: Number, required: true, min: 1, max: 20 },
  },
  { timestamps: true }
);
tableSchema.index({ restaurant: 1, label: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
