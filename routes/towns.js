const express = require('express');
const Town = require('../models/Town');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

router.get('/', async (req, res, next) => {
  try {
    res.status(200).json(await Town.find().sort({ name: 1 }));
  } catch (err) { next(err); }
});

router.get('/:id', validateId(), async (req, res, next) => {
  try {
    const town = await Town.findById(req.params.id);
    if (!town) return res.status(404).json({ message: 'Town not found' });
    res.status(200).json(town);
  } catch (err) { next(err); }
});

router.post('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    res.status(201).json(await Town.create(req.body));
  } catch (err) { next(err); }
});

router.put('/:id', protect, requireRole('admin'), validateId(), async (req, res, next) => {
  try {
    const town = await Town.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!town) return res.status(404).json({ message: 'Town not found' });
    res.status(200).json(town);
  } catch (err) { next(err); }
});

router.delete('/:id', protect, requireRole('admin'), validateId(), async (req, res, next) => {
  try {
    const town = await Town.findByIdAndDelete(req.params.id);
    if (!town) return res.status(404).json({ message: 'Town not found' });
    res.status(200).json({ message: 'Town deleted' });
  } catch (err) { next(err); }
});

module.exports = router;