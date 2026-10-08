const express = require('express');
const mongoose = require('mongoose');
const Town = require('../models/Town');
const router = express.Router();

// TODO: import Nadia's auth and admin middleware, then add them to POST, PUT, DELETE

const checkId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid town ID' });
  }
  next();
};

router.get('/', async (req, res, next) => {
  try {
    res.status(200).json(await Town.find().sort({ name: 1 }));
  } catch (err) { next(err); }
});

router.get('/:id', checkId, async (req, res, next) => {
  try {
    const town = await Town.findById(req.params.id);
    if (!town) return res.status(404).json({ message: 'Town not found' });
    res.status(200).json(town);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Town.create(req.body));
  } catch (err) { next(err); }
});

router.put('/:id', checkId, async (req, res, next) => {
  try {
    const town = await Town.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!town) return res.status(404).json({ message: 'Town not found' });
    res.status(200).json(town);
  } catch (err) { next(err); }
});

router.delete('/:id', checkId, async (req, res, next) => {
  try {
    const town = await Town.findByIdAndDelete(req.params.id);
    if (!town) return res.status(404).json({ message: 'Town not found' });
    res.status(200).json({ message: 'Town deleted' });
  } catch (err) { next(err); }
});

module.exports = router;