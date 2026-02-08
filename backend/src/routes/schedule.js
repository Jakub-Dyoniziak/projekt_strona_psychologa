const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requirePsychologist } = require('../auth/authMiddleware');
const { body, validationResult } = require('express-validator');

router.post('/block', authenticate, requirePsychologist, [
  body('start').isISO8601(),
  body('end').isISO8601(),
  body('reason').optional().isString()
], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { start, end, reason } = req.body;
  const psychologist_id = req.user.id;

  try {
    const insertQ = `INSERT INTO blocked_slots (psychologist_id, time_range, reason) VALUES ($1, tstzrange($2::timestamptz, $3::timestamptz, '[)'), $4) RETURNING *`;
    const result = await db.query(insertQ, [psychologist_id, start, end, reason || null]);
    res.status(201).json({ blocked: result.rows[0] });
  } catch (err) {
    if (err.code === '23P01') {
      return res.status(409).json({ error: 'Przedział pokrywa się z innym zablokowanym terminem' });
    }
    console.error(err); res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.delete('/block/:id', authenticate, requirePsychologist, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const del = await db.query('DELETE FROM blocked_slots WHERE id=$1 AND psychologist_id=$2 RETURNING id', [id, req.user.id]);
    if (del.rowCount === 0) return res.status(404).json({ error: 'Brak takiego bloku' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/blocks', authenticate, requirePsychologist, async (req, res) => {
  try {
    const q = `SELECT id, lower(time_range) as start, upper(time_range) as end, reason FROM blocked_slots WHERE psychologist_id = $1 ORDER BY lower(time_range)`;
    const result = await db.query(q, [req.user.id]);
    res.json({ blocks: result.rows });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;