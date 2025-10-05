// SessionDebug.js - Debug component to show session information
import React, { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

const SessionDebug = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateSessionInfo = () => {
      const current = AuthService.getCurrentSession();
      const active = AuthService.getActiveSessions();
      setSessionInfo({ current, active });
    };

    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!sessionInfo || process.env.NODE_ENV === 'production') {
    return null;
  }

  const debugStyle = {
    position: 'fixed',
    top: isVisible ? '10px' : '-200px',
    right: '10px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '12px',
    zIndex: 9999,
    transition: 'top 0.3s ease',
    maxWidth: '300px',
    maxHeight: '400px',
    overflow: 'auto'
  };

  const toggleStyle = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '3px',
    fontSize: '11px',
    cursor: 'pointer',
    zIndex: 10000
  };

  return (
    <>
      <button style={toggleStyle} onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide' : 'Debug'}
      </button>
      <div style={debugStyle}>
        <h4>🔍 Session Debug</h4>
        <div>
          <strong>Current Session:</strong>
          <pre>{JSON.stringify(sessionInfo.current, null, 2)}</pre>
        </div>
        <div>
          <strong>Active Sessions ({Object.keys(sessionInfo.active).length}):</strong>
          <pre>{JSON.stringify(sessionInfo.active, null, 2)}</pre>
        </div>
        <div>
          <strong>Storage Info:</strong>
          <div>sessionStorage keys: {Object.keys(sessionStorage).join(', ')}</div>
          <div>localStorage activeSessions: {localStorage.getItem('activeSessions')}</div>
        </div>
      </div>
    </>
  );
};

export default SessionDebug;