import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        {user && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/board" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/board" /> : <Register setUser={setUser} />} />
          <Route path="/board" element={user ? <KanbanBoard user={user} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;