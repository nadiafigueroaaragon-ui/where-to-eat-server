// seed/seeders/05-mabalacat-restaurants.js  (Mabalacat, 10 restaurants)
const Restaurant = require('../../models/Restaurant');
const { TOWNS, DAYS } = require('../../config/constants');

const TOWN = 'Mabalacat';
if (!TOWNS.includes(TOWN)) throw new Error(`${TOWN} is not in TOWNS in constants.js`);

// Same opening hours every day. Adjust per restaurant later if you want.
const hours = Object.fromEntries(
  DAYS.map((d) => [d, { open: '10:00', close: '21:00', closed: false }])
);

// Coordinates are rough placeholders. Replace each lat/lng from Google Maps.
const data = [
  { name: 'Recado', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Consuelo', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, openingHours: hours,
    description: 'TODO short description' },
  { name: "Italianni's SM Clark", area: 'Mabalacat', address: 'SM City Clark, Mabalacat', lat: 15.19, lng: 120.56,
    cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 700, seatsPerSlot: 40, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Toscana Dining', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 700, seatsPerSlot: 30, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Manam Comfort Filipino SM Clark', area: 'Mabalacat', address: 'SM City Clark, Mabalacat', lat: 15.19, lng: 120.56,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 450, seatsPerSlot: 40, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Unseen Cafe', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Cafe/Bakery', diningType: 'cafe/bakery', priceLevel: 'moderate',
    averageMealCost: 350, seatsPerSlot: 20, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Hard Rock Cafe', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Western/Italian', diningType: 'resto bar', priceLevel: 'expensive',
    averageMealCost: 900, seatsPerSlot: 50, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Binulo Capampangan Restaurant', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'cheap',
    averageMealCost: 400, seatsPerSlot: 30, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Casa Salome', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, openingHours: hours,
    description: 'TODO short description' },
  { name: 'Couscousi Mediterranean Grill', area: 'Mabalacat', address: 'TODO address', lat: 15.19, lng: 120.56,
    cuisine: 'Mediterranean', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 30, openingHours: hours,
    description: 'TODO short description' },
];

module.exports = async (ctx) => {
  const owner = Array.isArray(ctx.users) ? ctx.users[0] : Object.values(ctx.users)[0];

  const docs = data.map(({ lat, lng, ...r }) => ({
    ...r,
    town: TOWN, // plain string from the TOWNS list, not an id
    status: 'approved',
    owner: owner._id,
    location: { type: 'Point', coordinates: [lng, lat] }, // [longitude, latitude]
  }));

  const created = await Restaurant.insertMany(docs);
  ctx.restaurants = [...(ctx.restaurants || []), ...created];
};