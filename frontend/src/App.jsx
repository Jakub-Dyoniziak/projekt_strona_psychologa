import Login from './pages/login';
import { useAuth } from './auth/AuthContext';

function App() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <h1>Witaj, {user.first_name}</h1>
      <p>Rola: {user.is_psychologist ? 'Psycholog' : 'Pacjent'}</p>

      <button onClick={logout}>Wyloguj</button>
    </div>
  );
}

export default App;