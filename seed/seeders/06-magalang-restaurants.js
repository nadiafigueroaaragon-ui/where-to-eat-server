const fs = require('fs');
const path = require('path');
const Restaurant = require('../../models/Restaurant');
const User = require('../../models/User');
const { DAYS } = require('../../config/constants');

const TOWN = 'Magalang';
const IMAGE_DIR = path.join(__dirname, '../../client/public/images');

const h = (open, close) => ({ open, close, closed: false });
const hours = (everyDay) => Object.fromEntries(DAYS.map((d) => [d, everyDay]));

// Finds /images/<prefix>1.ext, <prefix>2.ext ... in number order, whatever the extension.
const galleryFor = (prefix) => {
  const re = new RegExp(`^${prefix}(\\d+)\\.(jpe?g|png|webp)$`, 'i');
  return fs
    .readdirSync(IMAGE_DIR)
    .map((f) => ({ f, m: f.match(re) }))
    .filter((x) => x.m)
    .sort((a, b) => Number(a.m[1]) - Number(b.m[1]))
    .map((x) => `/images/${x.f}`);
};

// ESTIMATE = my guess, check it. Restaurants without their own lat/lng use the town-center pin,
// so "near me" distance is wrong for them. On Google Maps: right-click the place, click the first
// line (it copies "lat, lng"), then add  lat: ..., lng: ...  to that entry.
const PLACEHOLDER = {
  lat: 15.2143,
  lng: 120.66,
  priceLevel: 'moderate',
  averageMealCost: 400,
  seatsPerSlot: 30,
  openingHours: hours(h('10:00', '21:00')),
};

const data = [
  {
    name: "Annie's Restaurant", area: 'Don Luis Dizon Dr.',
    imageUrl: '/images/annies.jpg', gallery: 'annies',
    address: 'Stall 3, Acejo Building, Don Luis Dizon Dr., Magalang, 2011 Pampanga',
    cuisine: 'Asian', diningType: 'casual dining',
    priceLevel: 'moderate', averageMealCost: 350, seatsPerSlot: 30, // ESTIMATE
    description: 'Pakistani and South Asian curry in Magalang.',
  },
  {
    name: 'JIRO Sukiyaki, Sushi, Ramen', area: 'Magalang Town Proper',
    imageUrl: '/images/jiro.webp', gallery: 'jiro',
    address: 'Plus Code 6J4X+944, Magalang, Pampanga',
    lat: 15.205888, lng: 120.647828, // decoded from Plus Code 6J4X+944
    cuisine: 'Asian', diningType: 'casual dining',
    priceLevel: 'moderate', averageMealCost: 450, seatsPerSlot: 40, // ESTIMATE
    description: 'Traditional Japanese: sukiyaki, sushi and ramen.',
  },
  {
    name: "Bembi's Kitchen", area: 'Marbea Subdivision',
    imageUrl: '/images/bembi.webp', gallery: 'bembi',
    address: '910 Marbea Subdivision, Magalang, 2011 Pampanga',
    cuisine: 'Western/Italian', diningType: 'casual dining',
    priceLevel: 'moderate', averageMealCost: 350, seatsPerSlot: 30, // ESTIMATE
    description: 'Italian and Western comfort food.',
  },
  {
    name: "Paco's Tacos", area: 'O. Gueco St.',
    imageUrl: '/images/paco.jpeg', gallery: 'paco',
    address: '1066 O. Gueco, Magalang, Pampanga',
    cuisine: 'Mexican', diningType: 'casual dining',
    priceLevel: 'cheap', averageMealCost: 250, seatsPerSlot: 20, // ESTIMATE
    description: 'Mexican tacos and burritos.',
  },
  {
    name: "Kayel's", area: 'Magalang Town Proper',
    imageUrl: '/images/kayel.jpg', gallery: 'kayel',
    address: 'Magalang, 2011 Pampanga',
    cuisine: 'Asian', diningType: 'buffet', // unlimited samgyupsal and wings
    priceLevel: 'moderate', averageMealCost: 400, seatsPerSlot: 40, // ESTIMATE
    description: 'Unlimited Korean BBQ (samgyupsal) and chicken wings.',
  },
  {
    name: 'Alonzo Restaurant by Chef Jen', area: 'San Miguel (Amelia Homes)',
    imageUrl: '/images/alonzo.jpg', gallery: 'alonzo',
    address: 'Amelia Homes, San Miguel, Magalang, 2011 Pampanga',
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining',
    priceLevel: 'moderate', averageMealCost: 500, seatsPerSlot: 30, // ESTIMATE
    description: 'Modern Filipino fusion by Chef Jen.',
  },
  {
    name: 'Kainan sa Hardin', area: 'Marbea Subdivision, San Nicolas 2nd',
    imageUrl: '/images/hardin.webp', gallery: 'hardin',
    address: '008 Marbea Subdivision, San Nicolas 2nd, Phase 1, Magalang, Pampanga',
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining',
    priceLevel: 'moderate', averageMealCost: 450, seatsPerSlot: 40, // ESTIMATE
    description: 'Traditional Kapampangan food in a garden setting.',
  },
  {
    name: 'Mars Leon Grill & Resto Bar', area: 'Lapaz',
    imageUrl: '/images/mars.jpg', gallery: 'mars',
    address: 'Lapaz, Magalang, 2011 Pampanga',
    openingHours: hours(h('19:00', '03:00')), // open nights only, closes after midnight
    cuisine: 'Kapampangan/Filipino', diningType: 'resto bar',
    priceLevel: 'moderate', averageMealCost: 450, seatsPerSlot: 40, // ESTIMATE
    description: 'Filipino grill and restobar, also a nightspot. Open nights only, 7 PM to 3 AM.',
  },
  {
    name: 'Altezza Cabins', area: 'Mountain View, East Magalang',
    imageUrl: '/images/altezza.jpg', gallery: 'altezza',
    address: 'Plus Code 6P99+WV, Magalang, Pampanga',
    lat: 15.219812, lng: 120.719688, // decoded from Plus Code 6P99+WV
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining',
    priceLevel: 'moderate', averageMealCost: 600, seatsPerSlot: 40, // ESTIMATE
    description: 'Al fresco resort dining with a mountain view.',
  },
  {
    name: 'Café Béni', area: 'Phase 1',
    imageUrl: '/images/beni.jpg', gallery: 'beni',
    address: 'Phase 1, Magalang, Pampanga',
    cuisine: 'Cafe/Bakery', diningType: 'cafe/bakery',
    priceLevel: 'cheap', averageMealCost: 250, seatsPerSlot: 20, // ESTIMATE
    description: 'Specialty coffee and bakery desserts.',
  },
];

module.exports = async (ctx) => {
  const owner =
    (await User.findOne({ email: 'owner2@wheretoeat.ph' })) || (await User.findOne({ role: 'owner' }));
  if (!owner) throw new Error('No owner user found. 01-users.js must run before this seeder.');

  const needPin = data.filter((r) => r.lat === undefined).map((r) => r.name);
  if (needPin.length) console.warn(`  Still on the town-center pin (fix lat/lng): ${needPin.join(', ')}`);

  const noGallery = data.filter((r) => galleryFor(r.gallery).length === 0).map((r) => r.name);
  if (noGallery.length) console.warn(`  No gallery photos found for: ${noGallery.join(', ')}`);

  const docs = await Restaurant.create(
    data.map((r) => {
      const { lat, lng, gallery, ...rest } = { ...PLACEHOLDER, ...r };
      const images = galleryFor(gallery);
      return {
        ...rest,
        images: images.length ? images : [r.imageUrl], // gallery on the details page
        town: TOWN,
        owner: owner._id,
        location: { type: 'Point', coordinates: [lng, lat] }, // GeoJSON order: [longitude, latitude]
        status: 'approved',
      };
    })
  );

  ctx.restaurants = Array.isArray(ctx.restaurants) ? ctx.restaurants.concat(docs) : docs;
};