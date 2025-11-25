const express = require('express');
const db = require('../db');
const { UpsertSchema, BatchSchema } = require('../validation/schemas');

const router = express.Router();

// GET /api/prayers - return all
router.get('/', async (req, res, next) => {
  try {
    const all = await db.getAll();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// GET /api/prayers/:dateKey
router.get('/:dateKey', async (req, res, next) => {
  try {
    const dateKey = req.params.dateKey;
    const result = await db.getByDate(dateKey);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/prayers - upsert single prayer status
router.post('/', async (req, res, next) => {
  try {
    const parsed = UpsertSchema.parse(req.body);
    const updated = await db.upsertPrayer(parsed.date, parsed.prayer, parsed.status);
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
});

// POST /api/prayers/batch - get multiple dates
router.post('/batch', async (req, res, next) => {
  try {
    const parsed = BatchSchema.parse(req.body);
    const result = await db.getBatch(parsed.dates);
    res.json(result);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
});

// DELETE /api/prayers/:dateKey - optional convenience endpoint
router.delete('/:dateKey', async (req, res, next) => {
  try {
    const ok = await db.deleteByDate(req.params.dateKey);
    res.json({ success: ok });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
