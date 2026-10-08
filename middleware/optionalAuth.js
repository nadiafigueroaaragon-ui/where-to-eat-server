// Like Nadia's "protect", but never blocks: if there is a valid token, req.user is set; otherwise the request continues as a guest.
// Matches Nadia's protect: the JWT payload holds the user id as `id`.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.user = await User.findById(payload.id || payload._id || payload.userId).select('-password');
    } catch (e) {
      /* invalid or expired token -> treat as guest */
    }
  }
  next();
};
