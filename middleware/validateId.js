const mongoose = require('mongoose');

// Everyone reuses this so bad IDs give 400 (not 500):  router.get('/:id', validateId(), handler)
module.exports = (param = 'id') => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
  next();
};
