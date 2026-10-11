const Town = require('../../models/Town');
const Restaurant = require('../../models/Restaurant');

// Angeles City dataset. Ratings are INITIAL DATASET values, not live ratings.
// Nothing here is invented: no addresses, phone numbers, hours or prices. Images are left empty
// (the frontend shows a placeholder until real photos are added to `image`).
const data = [
  { slug: 'bale-dutung', name: 'Bale Dutung', cuisine: 'Kapampangan Fine Dining', cuisineGroup: 'Kapampangan', rating: 4.4,
    description: 'Set tasting menus served in a wooden house built using salvaged ancestral homes.',
    experiences: ['fine-dining'], notes: [{ text: 'Reservations should be made in advance.', verified: true }] },
  { slug: 'matam-ih', name: 'Matam-ih', cuisine: 'Kapampangan', cuisineGroup: 'Kapampangan', area: 'Clark', rating: 4.1,
    description: 'A casual dining destination suitable for groups.',
    recommendedDishes: ['Sisig', 'Ensaladang pako'], experiences: ['group-gatherings', 'casual-dining'] },
  { slug: '25-seeds', name: '25 Seeds', cuisine: 'Modern Filipino', cuisineGroup: 'Filipino', rating: 4.4,
    description: 'A restaurant set in an old Filipino-Spanish ancestral house.',
    recommendedDishes: ['Sisig paella', 'Bibingka cheesecake'],
    notes: [{ text: 'Listed as closed on Mondays - please verify before visiting.', verified: false }] },
  { slug: 'sayam-house', name: 'Sayam House', cuisine: 'Thai', cuisineGroup: 'Thai', area: 'Clark', rating: 4.7,
    description: 'A Thai restaurant known for its pad thai and satay.', recommendedDishes: ['Pad thai', 'Satay'] },
  { slug: 'niji-infinity', name: 'Niji Infinity', cuisine: 'Japanese', cuisineGroup: 'Japanese', area: 'Infinity Mall', rating: 4.5,
    description: 'Japanese dining featuring sushi, sashimi, and bento sets.', recommendedDishes: ['Sushi', 'Sashimi', 'Bento sets'] },
  { slug: 'chonnom-korea-town', name: 'ChonNom Korea Town', cuisine: 'Korean', cuisineGroup: 'Korean', rating: 4.5,
    description: 'Korean dining featuring galbi-tang, steamed seafood, and lobster at comparatively accessible prices.',
    recommendedDishes: ['Galbi-tang', 'Steamed seafood', 'Lobster'], experiences: ['late-night'],
    notes: [{ text: 'Reported to be open until 2 AM - verify current hours before going.', verified: false }] },
  { slug: 'al-bacio', name: 'Al Bacio', cuisine: 'Italian', cuisineGroup: 'Italian', rating: 4.3,
    description: 'Italian dining featuring pasta, pizza, and wine.', recommendedDishes: ['Pasta', 'Pizza'],
    experiences: ['date-night'], notes: [{ text: 'Best suited for date nights and relaxed dinners.', verified: true }] },
  { slug: 'taj-indian-restaurant', name: 'Taj Indian Restaurant', cuisine: 'Indian', cuisineGroup: 'Indian', rating: 4.6,
    description: 'Indian dishes featuring biryani and shawarma.', recommendedDishes: ['Biryani', 'Shawarma'],
    notes: [{ text: 'Customer opinions on pricing vary.', verified: true }] },
  { slug: 'changkat-asian-kitchen', name: 'Changkat Asian Kitchen', cuisine: 'Malaysian', cuisineGroup: 'Asian', rating: 4.6,
    locationNote: 'Near the walking street', description: 'Malaysian cuisine featuring nasi lemak, rendang, and roti canai.',
    recommendedDishes: ['Nasi lemak', 'Rendang', 'Roti canai'] },
  { slug: 'hola-parade', name: 'Hola Parade', cuisine: 'Western / Italian', cuisineGroup: 'Italian', area: 'Clark', locationNote: 'Parade Grounds', rating: 4.9,
    description: 'A dining destination offering pasta, steaks, and sunset views over the Parade Grounds.',
    recommendedDishes: ['Pasta', 'Steak'], notes: [{ text: 'Customer feedback on its steak dishes is mixed.', verified: true }] },
];

// Safe to re-run: upserts by slug, never deletes anything.
module.exports = async (ctx) => {
  const town = await Town.findOneAndUpdate(
    { name: 'Angeles City' },
    { $setOnInsert: { province: 'Pampanga', coordinates: { lat: 15.145, lng: 120.596 } } },
    { upsert: true, new: true }
  );

  await Restaurant.bulkWrite(
    data.map((r) => ({ updateOne: { filter: { slug: r.slug }, update: { $set: { ...r, town: town._id } }, upsert: true } }))
  );

  const saved = await Restaurant.find({ slug: { $in: data.map((r) => r.slug) } });
  ctx.restaurants = {};
  saved.forEach((r) => { ctx.restaurants[r.slug] = r; });
  console.log(`  ${saved.length}/${data.length} Angeles City restaurants upserted`);
};
