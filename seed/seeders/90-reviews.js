// Sample reviews for the demo. Runs LAST (90-) so every restaurant seeder has already run.
// All text below is made-up sample data, not real customer feedback.
const Review = require('../../models/Review');
const updateRestaurantRating = require('../../utils/updateRestaurantRating');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// [restaurant name contains, traveler index 0-3, rating, status, days ago visited, comment]
const SAMPLE = [
  ['bale dutung', 0, 5, 'approved', 40, 'The tasting menu was well paced and every course felt thought through. Booking ahead was worth it.'],
  ['bale dutung', 1, 4, 'approved', 25, 'Lovely setting and warm service. A bit pricey, but it felt like a special occasion.'],
  ['bale dutung', 2, 5, 'pending', 3, 'Second visit and still great. The dessert course was the highlight of the night.'],
  ['matam-ih', 0, 4, 'approved', 30, 'Good for a group. We shared the sisig and ensaladang pako and nothing was left.'],
  ['matam-ih', 3, 3, 'approved', 12, 'Tasty food, but we waited a long time for our table on a Saturday.'],
  ['25 seeds', 1, 5, 'approved', 18, 'The sisig paella and the bibingka cheesecake are both worth ordering. Lovely old house.'],
  ['sayam', 2, 5, 'approved', 9, 'The pad thai had a nice balance of sweet and sour, and the satay came out hot.'],
  ['sayam', 0, 4, 'pending', 2, 'Friendly staff and quick service. Portions are a little small for the price.'],
  ['niji', 3, 4, 'approved', 21, 'Fresh sashimi and a generous bento set for a mall restaurant.'],
  ['chonnom', 1, 5, 'approved', 14, 'Stayed late after a night out and the galbi-tang was exactly what we needed.'],
  ['hola parade', 2, 4, 'approved', 7, 'The sunset view over the Parade Grounds is the real star. Pasta was good.'],
  ['hola parade', 3, 3, 'approved', 5, 'Steak came out more done than I asked for, but the view made up for it.'],
  ['changkat', 0, 5, 'approved', 16, 'Rendang was rich and the roti canai was crisp. Easy walk from the walking street.'],
  ['taj', 1, 3, 'pending', 4, 'Flavors were authentic and the biryani was fragrant, though it felt a bit expensive.'],
  ['rainforest', 2, 4, 'approved', 20, 'Beautiful garden setting and a well-cooked steak. Good for a family lunch.'],
  ['souq', 3, 4, 'approved', 11, 'Cozy rustic place. The Kapampangan dishes were familiar and comforting.'],
  ['denlim', 0, 5, 'pending', 1, 'The Italian-Kapampangan fusion was creative and the private room was a nice touch.'],
  ['chef baboy', 1, 4, 'approved', 8, 'Plenty of meat choices for the unlimited set and the staff kept the grill going.'],
  ['kainan sa hardin', 2, 5, 'approved', 13, 'Eating in the garden felt relaxing and the Kapampangan classics were done right.'],
  ['jiro', 3, 4, 'pending', 2, 'Ramen broth was rich and the sukiyaki set was good value for two.'],
  ['recado', 0, 4, 'approved', 10, 'Handsome interior and well-seasoned Kapampangan dishes. Gets busy at dinner.'],
  ['binulo', 1, 4, 'approved', 6, 'The slow-cooked dishes had real depth of flavor. Service was friendly.'],
  ['hard rock', 2, 3, 'pending', 3, 'Fun atmosphere and good burgers, but it was louder than I expected.'],
  ['unseen', 3, 1, 'rejected', 15, 'Best deals here!!! Visit my page for free vouchers and cheap followers.'],
];

module.exports = async (ctx) => {
  const travelers = ctx.users?.travelers;
  if (!travelers?.length) throw new Error('Reviews seed needs ctx.users.travelers from 01-users.js');

  const restaurants = Array.isArray(ctx.restaurants) ? ctx.restaurants : Object.values(ctx.restaurants || {});
  if (restaurants.length === 0) {
    console.log('  (no restaurants seeded yet, skipping reviews)');
    return;
  }

  const byName = (key) => restaurants.find((r) => r.name.toLowerCase().includes(key));
  const used = new Set();
  const docs = [];

  for (const [key, who, rating, status, days, comment] of SAMPLE) {
    const restaurant = byName(key);
    if (!restaurant) continue; // a teammate may have spelled the name differently
    const user = travelers[who % travelers.length];
    const pair = `${restaurant._id}-${user._id}`;
    if (used.has(pair)) continue; // one review per traveler per restaurant
    used.add(pair);
    docs.push({ restaurant: restaurant._id, user: user._id, rating, status, visitDate: daysAgo(days), comment });
  }

  const reviews = await Review.insertMany(docs);
  ctx.reviews = reviews;

  // Ratings are computed from approved reviews only. Restaurants with none end up 0 reviews.
  for (const r of restaurants) await updateRestaurantRating(r._id);

  const count = (s) => reviews.filter((x) => x.status === s).length;
  console.log(
    `  ${reviews.length} reviews (${count('approved')} approved, ${count('pending')} pending, ${count('rejected')} rejected)`
  );
};
