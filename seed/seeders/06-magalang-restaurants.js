const Restaurant = require('../../models/Restaurant');
const User = require('../../models/User');
const { DAYS } = require('../../config/constants');

const TOWN = 'Magalang';

// One day of hours, repeated for every day of the week.
const h = (open, close) => ({ open, close, closed: false });
const hours = (everyDay) => Object.fromEntries(DAYS.map((d) => [d, everyDay]));

// Addresses come from the group's research. Still PLACEHOLDERS (check on Google Maps before the demo):
// coordinates (Magalang town center, except JIRO and Altezza, which come from their Plus Codes),
// price level, average meal cost, seats per slot, and opening hours (except Mars Leon: 7 PM to 3 AM).
// "Near me" search uses the coordinates. Photos live in client/public/images.
const PLACEHOLDER = {
  area: undefined,
  address: 'Magalang, Pampanga',
  lat: 15.2143,
  lng: 120.66,
  priceLevel: 'moderate',
  averageMealCost: 400,
  seatsPerSlot: 30,
  openingHours: hours(h('10:00', '21:00')),
};

const data = [
  {
    name: "Annie's Restaurant",
    imageUrl: '/images/annies.jpg',
    address: 'Stall 3, Acejo Building, Don Luis Dizon Dr., Magalang, 2011 Pampanga',
    cuisine: 'Asian', diningType: 'casual dining',
    description: 'Pakistani and South Asian curry in Magalang.',
  },
  {
    name: 'JIRO Sukiyaki, Sushi, Ramen',
    imageUrl: '/images/jiro.webp',
    address: 'Plus Code 6J4X+944, Magalang, Pampanga (Magalang branch, no street address listed)',
    lat: 15.205888, lng: 120.647828, // decoded from Plus Code 6J4X+944
    cuisine: 'Asian', diningType: 'casual dining',
    description: 'Traditional Japanese: sukiyaki, sushi and ramen.',
  },
  {
    name: "Bembi's Kitchen",
    imageUrl: '/images/bembi.webp',
    address: '910 Marbea Subdivision, Magalang, 2011 Pampanga',
    cuisine: 'Western/Italian', diningType: 'casual dining',
    description: 'Italian and Western comfort food.',
  },
  {
    name: "Paco's Tacos",
    imageUrl: '/images/paco.jpeg',
    address: '1066 O. Gueco, Magalang, Pampanga',
    cuisine: 'Mexican', diningType: 'casual dining',
    description: 'Mexican tacos and burritos.',
  },
  {
    name: "Kayel's",
    imageUrl: '/images/kayel.jpg',
    address: 'Magalang, 2011 Pampanga (no street address listed; use the map pin)',
    cuisine: 'Asian', diningType: 'casual dining',
    description: 'Unlimited Korean BBQ (samgyupsal) and chicken wings.',
  },
  {
    name: 'Alonzo Restaurant by Chef Jen',
    imageUrl: '/images/alonzo.jpg',
    address: 'Amelia Homes, San Miguel, Magalang, 2011 Pampanga',
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining',
    description: 'Modern Filipino fusion by Chef Jen.',
  },
  {
    name: 'Kainan sa Hardin',
    imageUrl: '/images/hardin.webp',
    address: '008 Marbea Subdivision, San Nicolas 2nd, Phase 1, Magalang, Pampanga',
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining',
    description: 'Traditional Kapampangan food in a garden setting.',
  },
  {
    name: 'Mars Leon Grill & Resto Bar',
    imageUrl: '/images/mars.jpg',
    address: 'Lapaz, Magalang, 2011 Pampanga',
    openingHours: hours(h('19:00', '03:00')), // open nights only, closes after midnight
    cuisine: 'Kapampangan/Filipino', diningType: 'resto bar',
    description: 'Filipino grill and restobar, also a nightspot. Open nights only, 7 PM to 3 AM.',
  },
  {
    name: 'Altezza Cabins',
    imageUrl: '/images/altezza.jpg',
    address: 'Plus Code 6P99+WV, Magalang, Pampanga (up in the mountains, east of the town center)',
    lat: 15.219812, lng: 120.719688, // decoded from Plus Code 6P99+WV
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining',
    description: 'Al fresco resort dining with a mountain view.',
  },
  {
    name: 'Café Béni',
    imageUrl: '/images/beni.jpg',
    address: 'Phase 1, Magalang, Pampanga (no street number listed)',
    cuisine: 'Cafe/Bakery', diningType: 'cafe/bakery',
    description: 'Specialty coffee and bakery desserts.',
  },
];

module.exports = async (ctx) => {
  // Owner of these restaurants: owner2 if it exists, otherwise any owner.
  const owner =
    (await User.findOne({ email: 'owner2@wheretoeat.ph' })) || (await User.findOne({ role: 'owner' }));
  if (!owner) throw new Error('No owner user found. 01-users.js must run before this seeder.');

  const docs = await Restaurant.create(
    data.map((r) => {
      const { lat, lng, ...rest } = { ...PLACEHOLDER, ...r };
      return {
        ...rest,
        town: TOWN,
        owner: owner._id,
        location: { type: 'Point', coordinates: [lng, lat] }, // GeoJSON order: [longitude, latitude]
        status: 'approved',
      };
    })
  );

  // Share with later seeders (reservations, reviews)
  ctx.restaurants = Array.isArray(ctx.restaurants) ? ctx.restaurants.concat(docs) : docs;
};