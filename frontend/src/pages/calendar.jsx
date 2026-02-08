import { useState } from 'react';
import { apiFetch } from '../api/client';

function Calendar() {
  const [msg, setMsg] = useState(null);

  const book = async () => {
    try {
      await apiFetch('/api/appointments/book', {
        method: 'POST',
        body: JSON.stringify({
          psychologist_id: 1,
          start: '2026-03-01T10:00:00Z',
          duration_minutes: 60
        })
      });
      setMsg('Wizyta zarezerwowana');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Kalendarz wizyt</h2>
      <button onClick={book}>Zarezerwuj wizytę (test)</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default Calendar;