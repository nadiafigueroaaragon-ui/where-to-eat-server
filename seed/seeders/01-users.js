const User = require('../../models/User');

// Demo accounts (simple passwords on purpose)
module.exports = async (ctx) => {
  const admin = await User.create({ name: 'Admin', email: 'admin@wheretoeat.ph', password: 'admin123', role: 'admin' });

  const owners = [];
  for (const [i, name] of ['Owner One', 'Owner Two', 'Owner Three'].entries()) {
    owners.push(await User.create({ name, email: `owner${i + 1}@wheretoeat.ph`, password: 'owner123', role: 'owner' }));
  }

  const travelers = [];
  for (const [i, name] of ['Traveler One', 'Traveler Two', 'Traveler Three', 'Traveler Four'].entries()) {
    travelers.push(await User.create({ name, email: `traveler${i + 1}@wheretoeat.ph`, password: 'traveler123', role: 'traveler' }));
  }

  ctx.users = { admin, owners, travelers };
};
