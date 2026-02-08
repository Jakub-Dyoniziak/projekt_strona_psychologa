import Calendar from './calendar';
import PsychologistPanel from './psychologist_panel';
import { useAuth } from '../auth/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Panel użytkownika</h1>
      <p>Zalogowany jako: {user.email}</p>
      <button onClick={logout}>Wyloguj</button>

      {user.is_psychologist ? <PsychologistPanel /> : <Calendar />}
    </div>
  );
}

export default Dashboard;