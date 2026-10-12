// Adds the Angeles City restaurants WITHOUT wiping anything:   npm run seed:angeles
// Needs at least one owner account (npm run seed creates owner1@wheretoeat.ph on a local DB).
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const owner = await User.findOne({ role: 'owner' }).sort({ createdAt: 1 });
    if (!owner) throw new Error('No owner account found. Register an owner first, or run "npm run seed" on a local database.');
    await require('../seed/seeders/04-angeles-city-restaurants')({ users: { owners: [owner] } });
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
