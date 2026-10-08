// app.js = configuration and mounting ONLY. Teammates: add exactly one line to mount your routes.
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => res.status(200).json({ message: 'Where to Eat? API is running' }));

// ---- Mount routes. IMPORTANT: fixed routes (/restaurants/search, /mine, /nearby) must be
// ---- registered before /restaurants/:id, so keep each router's own order correct.
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/restaurants', require('./routes/restaurants'));  
// app.use('/restaurants', require('./routes/search'));        // Helayn (search/nearby/top-rated/open-now: mount BEFORE restaurants)
// app.use('/towns', require('./routes/towns'));               // Helayn
// app.use('/reservations', require('./routes/reservations')); // Ashton + Nadia
// app.use('/reviews', require('./routes/reviews'));           // Mhir

app.use(notFound);     // must stay second-to-last
app.use(errorHandler); // must stay last

module.exports = app;
