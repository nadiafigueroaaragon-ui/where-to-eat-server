// Standalone test seed for Andi's own database:  node scripts/seedSanFernando.js
// Only replaces San Fernando restaurants. Needs at least one user with role "owner" (run Nadia's `npm run seed` first).
require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const build = require('../seeder/sanFernandoRestaurants');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const owner = await User.findOne({ role: 'owner' });
  if (!owner) throw new Error('No owner user found. Run `npm run seed` first.');
  await Restaurant.deleteMany({ town: 'San Fernando' });
  const docs = await Restaurant.insertMany(build(owner._id));
  console.log(`Seeded ${docs.length} San Fernando restaurants (${docs.filter((d) => d.status === 'pending').length} pending)`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
