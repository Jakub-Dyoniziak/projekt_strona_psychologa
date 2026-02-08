import { useState } from 'react';
import { apiFetch } from '../api/client';

function Register({ onSwitch }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    is_psychologist: false
  });
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setMsg('Konto utworzone. Możesz się zalogować.');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Rejestracja</h2>
      {msg && <p>{msg}</p>}

      <form onSubmit={submit}>
        <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Hasło" onChange={e => setForm({ ...form, password: e.target.value })} />
        <input placeholder="Imię" onChange={e => setForm({ ...form, first_name: e.target.value })} />
        <input placeholder="Nazwisko" onChange={e => setForm({ ...form, last_name: e.target.value })} />

        <label>
          <input type="checkbox" onChange={e => setForm({ ...form, is_psychologist: e.target.checked })} />
          Jestem psychologiem
        </label>

        <button>Zarejestruj</button>
      </form>

      <button onClick={onSwitch}>Masz konto? Zaloguj się</button>
    </div>
  );
}

export default Register;