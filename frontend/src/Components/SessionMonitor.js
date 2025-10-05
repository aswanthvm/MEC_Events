// SessionMonitor.js - Component to monitor and manage multiple tab sessions
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const SessionMonitor = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let sessionCheckInterval;

    const checkSession = () => {
      // Check if current session is still valid
      if (!AuthService.isAuthenticated()) {
        return;
      }

      // Optional: Log current session info for debugging
      const currentSession = AuthService.getCurrentSession();
      console.log('Current session:', currentSession);
    };

    // Handle storage events (when localStorage changes in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'activeSessions') {
        // Sessions data changed in another tab
        const activeSessions = AuthService.getActiveSessions();
        const currentSessionId = sessionStorage.getItem('sessionId');
        
        console.log('Active sessions updated:', activeSessions);
        console.log('Current session ID:', currentSessionId);
        
        // If current session was removed by another tab, logout
        if (currentSessionId && !activeSessions[currentSessionId]) {
          console.log('Current session was terminated by another tab');
          AuthService.logout();
          navigate('/login', { replace: true });
        }
      }
    };

    // Set up periodic session check
    sessionCheckInterval = setInterval(checkSession, 30000); // Check every 30 seconds

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Initial session check
    checkSession();

    // Cleanup on unmount
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Handle tab/window close - cleanup session
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't logout on page refresh, only on tab close
      // This is tricky to detect perfectly, so we'll keep the session
      // and let it expire naturally or be cleaned up by timeout
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab is hidden/minimized
        console.log('Tab hidden');
      } else {
        // Tab is visible again
        console.log('Tab visible');
        // Recheck authentication when tab becomes visible
        if (!AuthService.isAuthenticated()) {
          navigate('/login', { replace: true });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  return children;
};

export default SessionMonitor;