// San Fernando seed (10 restaurants). Runs from seed/seed.js as async (ctx) => {...}
//
// !! VERIFY BEFORE THE DEFENSE !!  The names/descriptions come from the team guide. Everything else
// (coordinates, hours, prices, seats, exact addresses) is a ROUGH PLACEHOLDER I could not verify.
// For each place: open Google Maps -> right-click the pin -> click the numbers to copy "lat, lng" -> fix lat/lng below.
//
// PHOTOS: put pictures in client/public/images named  <slug>.jpg  (main photo) and  <slug>1.jpg ... <slug>5.jpg
// (.jpeg / .webp / .png also work). Each restaurant's `slug` is listed below. Only files that really exist
// are saved, so a missing photo never shows as a broken image. Add photos later, then re-run the seed.
const fs = require('fs');
const path = require('path');
const Restaurant = require('../../models/Restaurant');
const { DAYS } = require('../../config/constants');

const TOWN = 'San Fernando';

const IMAGE_DIR = path.join(__dirname, '../../client/public/images');
const EXTENSIONS = ['jpg', 'jpeg', 'webp', 'png'];

// First file name that exists for this base name, e.g. 'denlims1' -> 'denlims1.jpg'
const findFile = (base) => EXTENSIONS.map((ext) => `${base}.${ext}`).find((f) => fs.existsSync(path.join(IMAGE_DIR, f)));

// { imageUrl, images } for a slug, using only files that exist (empty object if none)
const gallery = (slug) => {
  const images = [1, 2, 3, 4, 5].map((n) => findFile(`${slug}${n}`)).filter(Boolean).map((f) => `/images/${f}`);
  const main = findFile(slug);
  const imageUrl = main ? `/images/${main}` : images[0];
  return imageUrl ? { imageUrl, images } : {};
};

const hours = (open, close, closedDays = []) =>
  Object.fromEntries(DAYS.map((d) => [d, { open, close, closed: closedDays.includes(d) }]));

const data = [
  { slug: 'denlims', name: "Denlim's Kitchen", area: 'San Agustin', address: 'San Agustin, City of San Fernando, Pampanga',
    lat: 15.0405, lng: 120.6745, cuisine: 'Western/Italian', diningType: 'fine dining', priceLevel: 'expensive',
    averageMealCost: 900, seatsPerSlot: 20, openingHours: hours('11:00', '21:00', ['monday']),
    description: 'Private dining and artisan Italian-Kapampangan fusion in San Agustin.', status: 'approved' },
  { slug: 'rainforest', name: 'Rainforest Kitchen by Chef Vince Garcia', area: 'Sindalan', address: 'Greenfields Square, Sindalan, City of San Fernando, Pampanga',
    lat: 15.0655, lng: 120.6600, cuisine: 'Western/Italian', diningType: 'fine dining', priceLevel: 'expensive',
    averageMealCost: 1200, seatsPerSlot: 30, openingHours: hours('11:00', '22:00'),
    description: 'Nature-inspired fine dining and steaks at Greenfields Square.', status: 'approved' },
  { slug: 'souq', name: 'Souq Restaurant Pampanga', address: 'Lazatin Boulevard, City of San Fernando, Pampanga',
    lat: 15.0362, lng: 120.6868, cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 40, openingHours: hours('10:00', '22:00'),
    description: 'Rustic Bohemian setting serving modern Kapampangan cuisine along Lazatin Boulevard.', status: 'approved' },
  { slug: 'balecap', name: 'Bale Capampangan', address: 'JASA (Jose Abad Santos Avenue), City of San Fernando, Pampanga',
    lat: 15.0318, lng: 120.6852, cuisine: 'Kapampangan/Filipino', diningType: 'buffet', priceLevel: 'moderate',
    averageMealCost: 650, seatsPerSlot: 60, openingHours: hours('11:00', '21:00'),
    description: 'Traditional Kapampangan buffet and local delicacies along JASA.', status: 'approved' },
  { slug: 'dishnthat', name: 'Dish n That', address: 'Bliss Hotel, Lazatin Boulevard, City of San Fernando, Pampanga',
    lat: 15.0358, lng: 120.6871, cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 400, seatsPerSlot: 25, openingHours: hours('10:00', '22:00'),
    description: 'Gourmet American smash burgers and Italian fusion at Bliss Hotel.', status: 'approved' },
  { slug: 'kawali', name: 'Kawali Specialty Cuisines', area: 'Quebiauan', address: 'Quebiauan, City of San Fernando, Pampanga',
    lat: 15.0135, lng: 120.6805, cuisine: 'Asian', diningType: 'casual dining', priceLevel: 'cheap',
    averageMealCost: 250, seatsPerSlot: 20, openingHours: hours('10:00', '21:00', ['tuesday']),
    description: 'Singaporean street food and comfort bites in Quebiauan.', status: 'pending' },
  { slug: 'lala', name: 'Lala Garden Cafe', address: 'JASA (Jose Abad Santos Avenue), City of San Fernando, Pampanga',
    lat: 15.0325, lng: 120.6848, cuisine: 'Cafe/Bakery', diningType: 'cafe/bakery', priceLevel: 'moderate',
    averageMealCost: 300, seatsPerSlot: 24, openingHours: hours('09:00', '20:00'),
    description: 'Aesthetic Korean-themed garden cafe with pastries along JASA.', status: 'approved' },
  { slug: 'everybodys', name: "Everybody's Cafe", area: 'Del Pilar', address: 'Del Pilar, City of San Fernando, Pampanga',
    lat: 15.0298, lng: 120.6892, cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 450, seatsPerSlot: 30, openingHours: hours('10:00', '20:00', ['sunday']),
    description: 'Historic heritage dining known for exotic Kapampangan dishes in Del Pilar.', status: 'approved' },
  { slug: 'chefbaboy', name: 'Chef Baboy', area: 'Sindalan', address: 'Greenfields Square, Sindalan, City of San Fernando, Pampanga',
    lat: 15.0652, lng: 120.6604, cuisine: 'Asian', diningType: 'buffet', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 40, openingHours: hours('11:00', '23:00'),
    description: 'Unlimited premium Korean BBQ and samgyeopsal at Greenfields Square.', status: 'pending' },
  { slug: 'noelle', name: 'Caf\u00e9 Noelle', area: 'Sindalan', address: 'Greenfields Square, Sindalan, City of San Fernando, Pampanga',
    lat: 15.0658, lng: 120.6598, cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 450, seatsPerSlot: 30, openingHours: hours('10:00', '22:00'),
    description: 'Western comfort food, a carabao beef specialty and desserts at Greenfields Square.', status: 'pending' },
];

module.exports = async (ctx) => {
  const owner = ctx.users.owners[0];

  const docs = data.map(({ lat, lng, slug, ...r }) => ({
    ...r,
    ...gallery(slug),
    town: TOWN,
    owner: owner._id,
    location: { type: 'Point', coordinates: [lng, lat] }, // GeoJSON order: [lng, lat]
  }));

  const created = await Restaurant.insertMany(docs);
  ctx.restaurants = [...(ctx.restaurants || []), ...created];
};