CREATE EXTENSION IF NOT EXISTS btree_gist;

-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  is_psychologist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  psychologist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  time_range TSTZRANGE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked', -- booked, cancelled, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- checking that appointments do not overlap
ALTER TABLE appointments
  ADD CONSTRAINT no_overlap_appointments
  EXCLUDE USING GIST (
    psychologist_id WITH =,
    time_range WITH &&
  );

-- Pre-appointment forms
CREATE TABLE IF NOT EXISTS pre_appointment_forms (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT CHECK (char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blocked slots (when psychologist blocks time for themselves)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id SERIAL PRIMARY KEY,
  psychologist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_range TSTZRANGE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- checking that blocked slots do not overlap
ALTER TABLE blocked_slots
  ADD CONSTRAINT no_overlap_blocked_slots
  EXCLUDE USING GIST (
    psychologist_id WITH =,
    time_range WITH &&
  );