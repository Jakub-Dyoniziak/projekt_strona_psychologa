import { useState } from 'react';
import { apiFetch } from '../api/client';

function PsychologistPanel() {
  const [msg, setMsg] = useState(null);

  const block = async () => {
    try {
      await apiFetch('/api/schedule/block', {
        method: 'POST',
        body: JSON.stringify({
          start: '2026-03-02T09:00:00Z',
          end: '2026-03-02T12:00:00Z',
          reason: 'Urlop'
        })
      });
      setMsg('Termin zablokowany');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Panel psychologa</h2>
      <button onClick={block}>Zablokuj termin (test)</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default PsychologistPanel;