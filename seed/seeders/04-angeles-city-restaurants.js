// Angeles City seed (10 restaurants). Runs from seed/seed.js as async (ctx) => {...}
//
// !! VERIFY BEFORE THE DEFENSE !!  Names, cuisines, ratings, recommended dishes and notes come from the
// team's Angeles City list. EVERYTHING marked PLACEHOLDER below is NOT verified data:
//   - lat/lng (all set to the Angeles City centre), exact addresses
//   - priceLevel, averageMealCost, seatsPerSlot, diningType
//   - openingHours (10:00-21:00 default, except the two places with reported hours)
//   - images (files in /images must be added to the client's public folder)
// For each place: Google Maps -> right-click pin -> copy "lat, lng" -> fix below.
// `rating` is the initial dataset value; the review code recalculates it from approved reviews later.
//
// Safe to re-run: a restaurant that already exists (same name + town) is skipped, never overwritten
// (it only gets images filled in if it has none).
const Restaurant = require('../../models/Restaurant');
const { DAYS } = require('../../config/constants');

const TOWN = 'Angeles City';
const C = { lat: 15.145, lng: 120.596 }; // PLACEHOLDER: same as the Angeles City town seed

const h = (open, close) => ({ open, close, closed: false });
const CLOSED = { open: '09:00', close: '21:00', closed: true };
const hours = (everyDay, overrides = {}) =>
  Object.fromEntries(DAYS.map((d) => [d, overrides[d] || everyDay]));
const DEFAULT_HOURS = h('10:00', '21:00'); // PLACEHOLDER

const data = [
  {
    name: 'Bale Dutung',
    imageUrl: '/images/baledutung1.jpg',
    images: [
      '/images/baledutung2.jpg',
      '/images/baledutung3.jpg',
      '/images/baledutung4.jpg',
      '/images/baledutung5.jpg',
      '/images/baledutung6.jpg',
    ],
    ...C,
    cuisine: 'Kapampangan/Filipino', diningType: 'fine dining', priceLevel: 'expensive',
    averageMealCost: 1500, seatsPerSlot: 30, rating: 4.4,
    openingHours: hours(DEFAULT_HOURS),
    description: 'Kapampangan fine dining: set tasting menus served in a wooden house built using salvaged ancestral homes. Reservations should be made in advance.',
  },
  {
    name: 'Matam-ih', area: 'Clark',
    imageUrl: '/images/matamih1.png',
    images: [
      '/images/matamih2.jpg',
      '/images/matamih3.jpg',
      '/images/matamih4.jpg',
      '/images/matamih5.jpg',
      '/images/matamih6.jpg',
    ],
    ...C,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, rating: 4.1,
    openingHours: hours(DEFAULT_HOURS),
    description: 'A casual Kapampangan dining destination suitable for groups. Recommended: sisig and ensaladang pako.',
  },
  {
    name: '25 Seeds',
    imageUrl: '/images/25seeds.JPG',
    images: [
      '/images/25seeds1.jpg',
      '/images/25seeds2.jpg',
      '/images/25seeds3.jpg',
      '/images/25seeds4.jpg',
      '/images/25seeds5.jpg',
    ],
    ...C,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 700, seatsPerSlot: 30, rating: 4.4,
    openingHours: hours(DEFAULT_HOURS, { monday: CLOSED }), // reported closed Mondays, verify
    description: 'Modern Filipino in an old Filipino-Spanish ancestral house. Recommended: sisig paella and bibingka cheesecake. Reported closed on Mondays - please verify.',
  },
  {
    name: 'Sayam House', area: 'Clark',
    imageUrl: '/images/sayamhouse.jpg',
    images: [
      '/images/sayamhouse1.jpg',
      '/images/sayamhouse2.jpg',
      '/images/sayamhouse3.jpg',
      '/images/sayamhouse4.jpg',
      '/images/sayamhouse5.jpg',
    ],
    ...C,
    cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, rating: 4.7,
    openingHours: hours(DEFAULT_HOURS),
    description: 'A Thai restaurant known for its pad thai and satay.',
  },
  {
    name: 'Niji Infinity', area: 'Infinity Mall',
    imageUrl: '/images/nijiinfinity.jpg',
    images: [
      '/images/niji1.jpg',
      '/images/niji2.jpg',
      '/images/niji3.jpg',
      '/images/niji4.jpg',
      '/images/niji5.jpg',
    ],
    address: 'Infinity Mall, Angeles City, Pampanga',
    ...C,
    cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 600, seatsPerSlot: 30, rating: 4.5,
    openingHours: hours(DEFAULT_HOURS),
    description: 'Japanese dining featuring sushi, sashimi, and bento sets.',
  },
  {
    name: 'ChonNom Korea Town',
    imageUrl: '/images/chonnom.jpg',
    images: [
      '/images/chonnom1.jpg',
      '/images/chonnom2.jpg',
      '/images/chonnom3.jpg',
      '/images/chonnom4.jpg',
      '/images/chonnom5.jpg',
    ],
    ...C,
    cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, rating: 4.5,
    openingHours: hours(h('11:00', '02:00')), // reported open until 2 AM, verify
    description: 'Korean dining featuring galbi-tang, steamed seafood, and lobster at comparatively accessible prices. Reported open until 2 AM - please verify current hours.',
  },
  {
    name: 'Al Bacio',
    imageUrl: '/images/albacio.jpg',
    images: [
      '/images/albacio1.jpg',
      '/images/albacio2.jpg',
      '/images/albacio3.jpg',
      '/images/albacio4.jpg',
      '/images/albacio5.jpg',
    ],
    ...C,
    cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 600, seatsPerSlot: 30, rating: 4.3,
    openingHours: hours(DEFAULT_HOURS),
    description: 'Italian dining featuring pasta, pizza, and wine. Best suited for date nights and relaxed dinners.',
  },
  {
    name: 'Taj Indian Restaurant',
    imageUrl: '/images/taj.jpg',
    images: [
      '/images/taj1.jpg',
      '/images/taj2.jpg',
      '/images/taj3.jpg',
      '/images/taj4.jpg',
      '/images/taj5.jpg',
    ],
    ...C,
    cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, rating: 4.6,
    openingHours: hours(DEFAULT_HOURS),
    description: 'Indian dishes featuring biryani and shawarma. Customer opinions on pricing vary.',
  },
  {
    name: 'Changkat Asian Kitchen',
    imageUrl: '/images/changkat.jpg',
    images: [
      '/images/changkat1.jpg',
      '/images/changkat2.jpg',
      '/images/changkat3.jpg',
      '/images/changkat4.jpg',
      '/images/changkat5.jpg',
    ],
    address: 'Near the walking street, Angeles City, Pampanga',
    ...C,
    cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 450, seatsPerSlot: 30, rating: 4.6,
    openingHours: hours(DEFAULT_HOURS),
    description: 'Malaysian cuisine featuring nasi lemak, rendang, and roti canai. Near the walking street.',
  },
  {
    name: 'Hola Parade', area: 'Clark',
    imageUrl: '/images/hola.jpg',
    images: [
      '/images/hola1.jpg',
      '/images/hola2.jpg',
      '/images/hola3.jpg',
      '/images/hola4.jpg',
      '/images/hola5.jpg',
    ],
    address: 'Parade Grounds, Clark, Angeles City, Pampanga',
    ...C,
    cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 800, seatsPerSlot: 30, rating: 4.9,
    openingHours: hours(DEFAULT_HOURS),
    description: 'Pasta, steaks, and sunset views over the Parade Grounds. Customer feedback on its steak dishes is mixed.',
  },
];

module.exports = async (ctx) => {
  const owner = ctx.users.owners[0]; // same convention as the other town seeders
  ctx.restaurants = ctx.restaurants || [];
  let added = 0;

  for (const { lat, lng, ...r } of data) {
    let doc = await Restaurant.findOne({ name: r.name, town: TOWN });
    if (!doc) {
      doc = await Restaurant.create({
        ...r,
        address: r.address || `${r.area ? `${r.area}, ` : ''}Angeles City, Pampanga`,
        town: TOWN,
        owner: owner._id,
        status: 'approved',
        location: { type: 'Point', coordinates: [lng, lat] }, // [longitude, latitude]
      });
      added += 1;
    } else {
  doc.imageUrl = r.imageUrl;
  doc.images = r.images;
  await doc.save();
}
    ctx.restaurants.push(doc);
  }
  console.log(`  Angeles City: ${added} added, ${data.length - added} already existed`);
};