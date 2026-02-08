import { useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import "./login_style.css";

function Login({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div id="log_panel">
      <h2>Logowanie</h2>
      {error && <p>{error}</p>}

      <form onSubmit={submit}>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Hasło" onChange={e => setPassword(e.target.value)} />
        <button id="log_button">Zaloguj</button>
      </form>

      <button onClick={onSwitch}>Załóż konto</button>
    </div>
  );
}

export default Login;