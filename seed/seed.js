// One command wipes and refills the database:  npm run seed
// Each teammate adds ONE file in seed/seeders/ (run in filename order). Each exports
// async function (ctx) {...}. ctx is shared: ctx.users, ctx.towns, ctx.restaurants, etc.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // load every model so we can wipe them all
    fs.readdirSync(path.join(__dirname, '../models'))
      .filter((f) => f.endsWith('.js'))
      .forEach((f) => require(path.join(__dirname, '../models', f)));

    for (const name of mongoose.modelNames()) await mongoose.model(name).deleteMany({});
    console.log('Database wiped');

    const ctx = {};
    const files = fs.readdirSync(path.join(__dirname, 'seeders')).filter((f) => f.endsWith('.js')).sort();
    for (const f of files) {
      console.log(`Seeding ${f} ...`);
      await require(path.join(__dirname, 'seeders', f))(ctx);
    }
    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
