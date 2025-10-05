// Logout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Logout.css'; // Import your CSS file

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated'); // Clear authentication status
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="logout-container">
      <div className="logout-card">
        <h1>Log Out</h1>
        <p>Are you sure you want to log out?</p>
        <button className="btn-logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Logout;
