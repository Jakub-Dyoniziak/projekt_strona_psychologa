import { useState } from 'react';
import { useAuth } from './auth/AuthContext';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';

function App() {
  const { user } = useAuth();
  const [mode, setMode] = useState('login');

  if (!user) {
    return mode === 'login'
      ? <Login onSwitch={() => setMode('register')} />
      : <Register onSwitch={() => setMode('login')} />;
  }

  return <Dashboard />;
}

export default App;