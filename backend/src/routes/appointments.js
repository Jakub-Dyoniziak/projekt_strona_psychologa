const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../auth/authMiddleware');
const { body, validationResult } = require('express-validator');
const format = require('pg-format');

router.post('/book', authenticate, [
  body('psychologist_id').isInt(),
  body('start').isISO8601(),
  body('duration_minutes').isInt({ min: 15 })
], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { psychologist_id, start, duration_minutes, pre_form_content } = req.body;
  const patient_id = req.user.id;

  const startTime = new Date(start);
  const endTime = new Date(startTime.getTime() + duration_minutes * 60000);

  const timeRange = `[${startTime.toISOString()},${endTime.toISOString()})`;

  try {
    const insertQuery = `
      INSERT INTO appointments (psychologist_id, patient_id, time_range, duration_minutes)
      VALUES ($1, $2, tstzrange($3::timestamptz, $4::timestamptz, '[)'), $5)
      RETURNING id, psychologist_id, patient_id, duration_minutes, time_range, status;
    `;
    const result = await db.query(insertQuery, [psychologist_id, patient_id, startTime.toISOString(), endTime.toISOString(), duration_minutes]);
    const appointment = result.rows[0];

    if (pre_form_content && pre_form_content.length > 0) {
      await db.query(
        `INSERT INTO pre_appointment_forms (appointment_id, patient_id, content) VALUES ($1,$2,$3)`,
        [appointment.id, patient_id, pre_form_content]
      );
    }
    res.status(201).json({ appointment });
  } catch (err) {
    if (err.code === '23P01' || (err.constraint && err.constraint.includes('no_overlap'))) {
      return res.status(409).json({ error: 'Termin już zajęty' });
    }
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/psychologist/:id', authenticate, async (req, res) => {
  const psychId = parseInt(req.params.id, 10);

  if (!req.user.is_psychologist || req.user.id !== psychId) {
    return res.status(403).json({ error: 'Brak dostępu' });
  }
  try {
    const q = `SELECT id, patient_id, duration_minutes, status, lower(time_range) as start, upper(time_range) as end FROM appointments WHERE psychologist_id = $1 ORDER BY lower(time_range) ASC`;
    const result = await db.query(q, [psychId]);
    res.json({ appointments: result.rows });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/mine', authenticate, async (req, res) => {
  try {
    const q = `SELECT a.id, a.psychologist_id, a.duration_minutes, a.status, lower(a.time_range) as start, upper(a.time_range) as end, p.first_name as psych_first, p.last_name as psych_last
               FROM appointments a
               LEFT JOIN users p on p.id = a.psychologist_id
               WHERE a.patient_id = $1
               ORDER BY lower(a.time_range) ASC`;
    const result = await db.query(q, [req.user.id]);
    res.json({ appointments: result.rows });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/:id/cancel', authenticate, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  try {
    const ap = await db.query('SELECT * FROM appointments WHERE id=$1', [appointmentId]);
    if (!ap.rows[0]) return res.status(404).json({ error: 'Brak wizyty' });
    const appointment = ap.rows[0];
    if (appointment.patient_id !== req.user.id && appointment.psychologist_id !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    await db.query('UPDATE appointments SET status=$1 WHERE id=$2', ['cancelled', appointmentId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;