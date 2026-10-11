// SAFE seeding: only adds/updates the Angeles City restaurants and demo tables. Wipes NOTHING.
//   npm run seed:restaurants
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const ctx = {};
    await require('./seeders/03-restaurants')(ctx);
    await require('./seeders/04-tables')(ctx);
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
