const Restaurant = require('../../models/Restaurant');
const { DAYS } = require('../../config/constants');

const TOWN = 'Mabalacat';

// One day of hours. If close is earlier than open, the place closes after midnight.
const h = (open, close) => ({ open, close, closed: false });
const CLOSED = { open: '09:00', close: '21:00', closed: true };
const hours = (everyDay, overrides = {}) =>
  Object.fromEntries(DAYS.map((d) => [d, overrides[d] || everyDay]));

const data = [
  {
    name: 'Recado', area: 'Filinvest Mimosa+ Leisure City',
    imageUrl: '/images/Recado.jpg',
    address: 'Filinvest Mimosa+, 2 Acacia Dr, Clark Freeport Zone, Mabalacat City, Pampanga, 2023',
    lat: 15.1834, lng: 120.5312,
    cuisine: 'Kapampangan/Filipino', diningType: 'fine dining', priceLevel: 'expensive',
    averageMealCost: 1200, seatsPerSlot: 100,
    openingHours: hours(h('12:00', '22:00'), { monday: CLOSED }),
    description: 'A vibrant dining destination in Filinvest Mimosa+ offering bold and fresh modern Filipino cuisine by Chef Carlos Villaflor.',
  },
  {
    name: 'Consuelo', area: 'Clark Freeport Zone (Barnhouse Precinct)',
    imageUrl: '/images/Consuelo.jpg',
    address: 'Barn House Bldg, 2092 R. C. Santos St, Clark Freeport Zone, Mabalacat, Pampanga, 2023',
    lat: 15.183292, lng: 120.525675,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 700, seatsPerSlot: 75,
    openingHours: hours(h('10:00', '21:00')),
    description: 'Named in honor of heirloom culinary traditions, serving elevated Kapampangan classics in a restored rustic barnhouse.',
  },
  {
    name: "Italianni's SM Clark", area: 'SM City Clark Complex',
    imageUrl: '/images/Italiannis.jpg',
    address: 'Ground Floor, Tech Hub 9, SM City Clark, Manuel A. Roxas Hwy, Clark Freeport Zone, Pampanga',
    lat: 15.170372, lng: 120.579127,
    cuisine: 'Western/Italian', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 900, seatsPerSlot: 120,
    openingHours: hours(h('10:00', '22:00')),
    description: 'Popular bistro chain offering American-Italian classics, signature pastas, pizzas, and complimentary fresh bread.',
  },
  {
    name: 'Toscana Dining', area: 'Midori Hotel & Casino, Clark Freeport Zone',
    imageUrl: '/images/Toscana.jpg',
    address: '1st Floor, Midori Clark Hotel & Casino, Claro M. Recto Hwy, Clark Freeport Zone, Pampanga',
    lat: 15.193264, lng: 120.521878,
    cuisine: 'Western/Italian', diningType: 'buffet', priceLevel: 'expensive',
    averageMealCost: 1900, seatsPerSlot: 175,
    openingHours: hours(h('06:00', '22:00')),
    description: 'Hotel buffet restaurant at Midori Clark, renowned for unlimited prime rib steak buffet nights and international spreads.',
  },
  {
    name: 'Manam Comfort Filipino SM City Clark', area: 'SM City Clark Complex',
    imageUrl: '/images/Manam.jpg',
    address: 'Ground Floor, SM City Clark Extension, Manuel A. Roxas Hwy, Clark Freeport Zone, Pampanga',
    lat: 15.169983, lng: 120.580681,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 500, seatsPerSlot: 110,
    openingHours: hours(h('11:00', '21:00'), { saturday: h('10:00', '21:00'), sunday: h('10:00', '21:00') }),
    description: 'Famous for its split menu featuring traditional comfort Filipino classics alongside inventive twists like Watermelon Sinigang and House Crispy Sisig.',
  },
  {
    name: 'Unseen Cafe', area: 'Santa Maria, Mabalacat City',
    imageUrl: '/images/unseen.jpg',
    address: 'Sitio Libutad, Brgy. Santa Maria, Mabalacat City, Pampanga',
    lat: 15.226654, lng: 120.594247,
    cuisine: 'Cafe/Bakery', diningType: 'cafe/bakery', priceLevel: 'cheap',
    averageMealCost: 250, seatsPerSlot: 40,
    openingHours: hours(CLOSED, {
      wednesday: h('14:00', '00:00'), thursday: h('14:00', '00:00'), friday: h('14:00', '00:00'),
      saturday: h('14:00', '00:00'), sunday: h('14:00', '00:00'),
    }),
    description: 'A minimalist neighborhood cafe hidden away in Mabalacat, serving espresso drinks, artisanal beverages, and light bites.',
  },
  {
    name: 'Hard Rock Cafe Clark', area: 'Hann Casino Resort, Clark Freeport Zone',
    imageUrl: '/images/HardRock.jpg',
    address: 'G/F Unit 102, Hann Resorts, C. M. Recto Hwy, Clark Freeport Zone, Pampanga',
    lat: 15.192066, lng: 120.524074,
    cuisine: 'Western/Italian', diningType: 'resto bar', priceLevel: 'expensive',
    averageMealCost: 900, seatsPerSlot: 125,
    openingHours: hours(h('11:00', '00:00'), { friday: h('11:00', '01:00'), saturday: h('11:00', '01:00') }),
    description: 'High-energy music venue with rock memorabilia, serving legendary burgers, ribs, cocktails, and hosting live band performances.',
  },
  {
    name: 'Binulo Restaurant', area: 'Clark Freeport Zone (M.A. Roxas Hwy)',
    imageUrl: '/images/Binulo.jpg',
    address: 'Bldg. N6410-6413, Manuel A. Roxas Highway, Clark Freeport Zone, Pampanga, 2009',
    lat: 15.183764, lng: 120.527112,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 600, seatsPerSlot: 150,
    openingHours: hours(h('11:00', '22:00')),
    description: 'Heritage restaurant specializing in authentic Kapampangan dishes traditionally cooked inside bamboo stalks (binulo).',
  },
  {
    name: 'Casa Salome', area: 'Duquit, Mabalacat City',
    imageUrl: '/images/Casa.jpg',
    address: 'Balacat Avenue, 7206 Legazpi Ext, Purok 7, Brgy. Duquit, Mabalacat City, Pampanga, 2010',
    lat: 15.179311, lng: 120.614627,
    cuisine: 'Kapampangan/Filipino', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 550, seatsPerSlot: 110,
    openingHours: hours(h('08:00', '22:00')),
    description: 'A vintage-inspired lifestyle estate featuring family-style Kapampangan dining, a coffee shop, and outdoor sports facilities.',
  },
  {
    name: 'Couscousi Mediterranean Grill', area: 'Clark Freeport Zone (Barnhouse Precinct)',
    imageUrl: '/images/Couscousi.jpg',
    address: 'RC Santos St., Parade Grounds Barnhouse 2079, Clark Freeport Zone, Mabalacat, Pampanga, 2023',
    lat: 15.181868, lng: 120.521943,
    cuisine: 'Mediterranean', diningType: 'casual dining', priceLevel: 'moderate',
    averageMealCost: 650, seatsPerSlot: 65,
    openingHours: hours(h('11:00', '22:00'), {
      friday: h('11:00', '23:00'), saturday: h('07:00', '23:00'), sunday: h('07:00', '22:00'),
    }),
    description: 'Rustic Mediterranean eatery serving spiced kebabs, seafood grill platters, shawarmas, and dips in the Clark Barnhouse strip.',
  },
];

module.exports = async (ctx) => {
  const owner = ctx.users.owners[2]; // keep the owner your old file used, if it was different

  const docs = data.map(({ lat, lng, ...r }) => ({
    ...r,
    town: TOWN, // plain string from the TOWNS list
    status: 'approved',
    owner: owner._id,
    location: { type: 'Point', coordinates: [lng, lat] }, // [longitude, latitude]
  }));

  const created = await Restaurant.insertMany(docs);
  ctx.restaurants = [...(ctx.restaurants || []), ...created];
};