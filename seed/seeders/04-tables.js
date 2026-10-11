const Table = require('../../models/Table');

// DEMO table inventory (not real floor plans): replace with real data when owners provide it.
const LAYOUT = [['T1', 2], ['T2', 2], ['T3', 2], ['T4', 4], ['T5', 4], ['T6', 4], ['T7', 6], ['T8', 6], ['T9', 10]];

module.exports = async (ctx) => {
  const restaurants = Object.values(ctx.restaurants || {});
  const ops = restaurants.flatMap((r) =>
    LAYOUT.map(([label, seats]) => ({
      updateOne: { filter: { restaurant: r._id, label }, update: { $set: { seats } }, upsert: true },
    }))
  );
  if (ops.length) await Table.bulkWrite(ops);
  console.log(`  ${ops.length} demo tables upserted (${LAYOUT.length} per restaurant)`);
};
