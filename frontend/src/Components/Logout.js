// Logout.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Logout.css'; // Import your CSS file
import AuthService from '../services/AuthService';

const Logout = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  
  const currentSession = AuthService.getCurrentSession();
  const activeSessions = AuthService.getActiveSessions();
  const sessionCount = Object.keys(activeSessions).length;

  const handleLogoutCurrent = () => {
    AuthService.logout(); // Logout current tab only
    navigate('/login', { replace: true });
  };

  const handleLogoutAll = () => {
    AuthService.logoutAll(); // Logout from all tabs
    navigate('/login', { replace: true });
  };

  return (
    <div className="logout-container">
      <div className="logout-card">
        <h1>Log Out</h1>
        <div className="session-info">
          <p><strong>Current Session:</strong> {currentSession.role} ({currentSession.email})</p>
          {sessionCount > 1 && (
            <p><strong>Active Sessions:</strong> {sessionCount} tabs open</p>
          )}
        </div>
        
        {!showOptions ? (
          <div className="logout-buttons">
            <button className="btn-logout" onClick={handleLogoutCurrent}>
              Log Out Current Tab
            </button>
            {sessionCount > 1 && (
              <button className="btn-logout-all" onClick={() => setShowOptions(true)}>
                More Options
              </button>
            )}
          </div>
        ) : (
          <div className="logout-options">
            <p>Choose logout option:</p>
            <button className="btn-logout" onClick={handleLogoutCurrent}>
              Log Out Current Tab Only
            </button>
            <button className="btn-logout-all" onClick={handleLogoutAll}>
              Log Out All Tabs ({sessionCount} sessions)
            </button>
            <button className="btn-cancel" onClick={() => setShowOptions(false)}>
              Cancel
            </button>
          </div>
        )}
        
        <div className="active-sessions">
          <h3>Active Sessions:</h3>
          {Object.entries(activeSessions).map(([sessionId, session]) => (
            <div key={sessionId} className={`session-item ${sessionId === currentSession.sessionId ? 'current' : ''}`}>
              <span className="session-role">{session.role}</span>
              <span className="session-email">{session.email}</span>
              <span className="session-time">{new Date(session.loginTime).toLocaleTimeString()}</span>
              {sessionId === currentSession.sessionId && <span className="current-marker">• Current Tab</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Logout;
