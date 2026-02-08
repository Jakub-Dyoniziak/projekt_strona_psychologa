const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidator, loginValidator } = require('../utils/validators');
const { validationResult } = require('express-validator');

router.post('/register', registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, first_name, last_name, phone, date_of_birth, is_psychologist } = req.body;
  const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10));
  try {
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, is_psychologist)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, first_name, last_name, is_psychologist`,
      [email, hashed, first_name, last_name, phone, date_of_birth, is_psychologist || false]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, is_psychologist: user.is_psychologist }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email już użyty' });
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/login', loginValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT id, email, password_hash, is_psychologist, first_name, last_name FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Nieprawidłowe dane' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Nieprawidłowe dane' });
    const token = jwt.sign({ id: user.id, email: user.email, is_psychologist: user.is_psychologist }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, is_psychologist: user.is_psychologist } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;