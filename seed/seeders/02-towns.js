const Town = require('../../models/Town');

const towns = [
  {
    name: 'Angeles City',
    description: 'Known for Balibago, Clark, and Friendship, with the widest mix of restaurants in Pampanga.',
    coordinates: { lat: 15.145, lng: 120.596 },
  },
  {
    name: 'San Fernando',
    description: 'The provincial capital, with dining along Lazatin Boulevard, JASA, and Greenfields.',
    coordinates: { lat: 15.029, lng: 120.689 },
  },
  {
    name: 'Magalang',
    description: 'A quieter town at the foot of Mount Arayat, known for garden and countryside dining.',
    coordinates: { lat: 15.214, lng: 120.659 },
  },
  {
    name: 'Mabalacat',
    description: 'Home to SM Clark and many restaurants near the Clark Freeport Zone.',
    coordinates: { lat: 15.217, lng: 120.573 },
  },
];

module.exports = async (ctx) => {
  const created = await Town.insertMany(towns);
  ctx.towns = {};
  created.forEach((t) => {
    ctx.towns[t.name] = t;
  });
};