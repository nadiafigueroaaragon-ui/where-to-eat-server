// Angeles City seed (10 restaurants). Runs from seed/seed.js as async (ctx) => {...}
//
// !! VERIFY BEFORE THE DEFENSE !!  Names, cuisines, ratings, recommended dishes and notes come from the
// team's Angeles City list. EVERYTHING marked PLACEHOLDER below is NOT verified data:
//   - coordinates (all set to the Angeles City centre), exact addresses
//   - priceLevel, averageMealCost, seatsPerSlot, diningType
//   - openingHours (left at the model default 09:00-21:00)
// For each place: Google Maps -> right-click pin -> copy "lat, lng" -> fix below.
// `rating` is the initial dataset value; the review code recalculates it from approved reviews later.
//
// Safe to re-run: a restaurant that already exists (same name + town) is skipped, never overwritten.
const Restaurant = require('../../models/Restaurant');

const TOWN = 'Angeles City';
const CENTER = { lat: 15.145, lng: 120.596 }; // PLACEHOLDER: same as the Angeles City town seed

const data = [
  { name: 'Bale Dutung', cuisine: 'Kapampangan/Filipino', diningType: 'fine dining', priceLevel: 'expensive', averageMealCost: 1500, rating: 4.4,
    description: 'Kapampangan fine dining: set tasting menus served in a wooden house built using salvaged ancestral homes. Reservations should be made in advance.' },
  { name: 'Matam-ih', area: 'Clark', cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 500, rating: 4.1,
    description: 'A casual Kapampangan dining destination suitable for groups. Recommended: sisig and ensaladang pako.' },
  { name: '25 Seeds', cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 700, rating: 4.4,
    description: 'Modern Filipino in an old Filipino-Spanish ancestral house. Recommended: sisig paella and bibingka cheesecake. Reported closed on Mondays - please verify.' },
  { name: 'Sayam House', area: 'Clark', cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 500, rating: 4.7,
    description: 'A Thai restaurant known for its pad thai and satay.' },
  { name: 'Niji Infinity', area: 'Infinity Mall', address: 'Infinity Mall, Angeles City, Pampanga', cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 600, rating: 4.5,
    description: 'Japanese dining featuring sushi, sashimi, and bento sets.' },
  { name: 'ChonNom Korea Town', cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 500, rating: 4.5,
    description: 'Korean dining featuring galbi-tang, steamed seafood, and lobster at comparatively accessible prices. Reported open until 2 AM - please verify current hours.' },
  { name: 'Al Bacio', cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 600, rating: 4.3,
    description: 'Italian dining featuring pasta, pizza, and wine. Best suited for date nights and relaxed dinners.' },
  { name: 'Taj Indian Restaurant', cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 500, rating: 4.6,
    description: 'Indian dishes featuring biryani and shawarma. Customer opinions on pricing vary.' },
  { name: 'Changkat Asian Kitchen', address: 'Near the walking street, Angeles City, Pampanga', cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 450, rating: 4.6,
    description: 'Malaysian cuisine featuring nasi lemak, rendang, and roti canai. Near the walking street.' },
  { name: 'Hola Parade', area: 'Clark', address: 'Parade Grounds, Clark, Angeles City, Pampanga', cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate', averageMealCost: 800, rating: 4.9,
    description: 'Pasta, steaks, and sunset views over the Parade Grounds. Customer feedback on its steak dishes is mixed.' },
];

module.exports = async (ctx) => {
  const owner = ctx.users.owners[0]; // same convention as the other town seeders
  ctx.restaurants = ctx.restaurants || [];
  let added = 0;

  for (const r of data) {
    let doc = await Restaurant.findOne({ name: r.name, town: TOWN });
    if (!doc) {
      doc = await Restaurant.create({
        ...r,
        address: r.address || `${r.area ? `${r.area}, ` : ''}Angeles City, Pampanga`,
        town: TOWN,
        owner: owner._id,
        seatsPerSlot: 30, // PLACEHOLDER capacity
        location: { type: 'Point', coordinates: [CENTER.lng, CENTER.lat] }, // GeoJSON [lng, lat]
        status: 'approved',
      });
      added += 1;
    }
    ctx.restaurants.push(doc);
  }
  console.log(`  Angeles City: ${added} added, ${data.length - added} already existed`);
};
