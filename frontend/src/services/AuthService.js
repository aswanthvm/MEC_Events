// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Auth Service
class AuthService {
  // Valid user roles
  static VALID_ROLES = ['admin', 'coordinator', 'user'];

  // Generate unique session ID for each tab
  static generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get or create session ID for current tab
  static getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Validate and sanitize role
  static validateRole(role) {
    return this.VALID_ROLES.includes(role) ? role : 'user';
  }

  // Set user authentication data with session isolation
  static setAuthData(userData) {
    try {
      const validatedRole = this.validateRole(userData.role);
      const sessionId = this.getSessionId();
      
      // Store in sessionStorage (tab-specific)
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userRole', validatedRole);
      sessionStorage.setItem('userEmail', userData.email || '');
      sessionStorage.setItem('userId', userData.id || '');
      sessionStorage.setItem('userName', userData.fullName || userData.name || '');
      sessionStorage.setItem('loginTime', Date.now().toString());
      
      if (userData.coordinatorName) {
        sessionStorage.setItem('coordinatorName', userData.coordinatorName);
      }
      
      // Also store session info with timestamp for multi-tab awareness
      const sessionData = {
        sessionId: sessionId,
        role: validatedRole,
        email: userData.email,
        loginTime: Date.now(),
        tabId: sessionId
      };
      
      // Store active sessions in localStorage (to track multiple tabs)
      const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '{}');
      activeSessions[sessionId] = sessionData;
      localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
      
      console.log('Auth data set successfully for session:', {
        sessionId: sessionId,
        role: validatedRole,
        email: userData.email,
        name: userData.fullName || userData.name
      });
      
      return validatedRole;
    } catch (error) {
      console.error('Error setting auth data:', error);
      this.logout();
      return null;
    }
  }

  // Register a new user
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data in localStorage with validation
      if (data.success && data.user) {
        this.setAuthData(data.user);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user (clear current tab session)
  static logout() {
    try {
      const sessionId = sessionStorage.getItem('sessionId');
      
      // Clear sessionStorage (current tab only)
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('coordinatorName');
      sessionStorage.removeItem('loginTime');
      sessionStorage.removeItem('sessionId');
      
      // Remove this session from active sessions
      if (sessionId) {
        const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '{}');
        delete activeSessions[sessionId];
        localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
      }
      
      console.log('User logged out successfully from session:', sessionId);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Clear all sessions (logout from all tabs)
  static logoutAll() {
    try {
      // Clear all sessionStorage in current tab
      this.logout();
      
      // Clear all active sessions
      localStorage.removeItem('activeSessions');
      
      console.log('All sessions logged out successfully');
    } catch (error) {
      console.error('Error during logout all:', error);
    }
  }

  // Check if user is authenticated with session validation
  static isAuthenticated() {
    const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';
    const role = sessionStorage.getItem('userRole');
    const sessionId = sessionStorage.getItem('sessionId');
    
    // If no session ID, create one but not authenticated
    if (!sessionId) {
      this.getSessionId();
      return false;
    }
    
    // If authenticated but no valid role, logout
    if (isAuth && !this.VALID_ROLES.includes(role)) {
      console.warn('Invalid role detected, logging out');
      this.logout();
      return false;
    }
    
    // Check if session is still active (optional: add session timeout)
    const loginTime = sessionStorage.getItem('loginTime');
    if (isAuth && loginTime) {
      const currentTime = Date.now();
      const sessionAge = currentTime - parseInt(loginTime);
      const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > MAX_SESSION_AGE) {
        console.warn('Session expired, logging out');
        this.logout();
        return false;
      }
    }
    
    return isAuth;
  }

  // Get current user role with validation (from current tab session)
  static getUserRole() {
    const role = sessionStorage.getItem('userRole');
    return this.validateRole(role);
  }

  // Get current user email (from current tab session)
  static getUserEmail() {
    return sessionStorage.getItem('userEmail');
  }

  // Get current user ID (from current tab session)
  static getUserId() {
    return sessionStorage.getItem('userId');
  }

  // Get current user name (from current tab session)
  static getUserName() {
    return sessionStorage.getItem('userName');
  }

  // Get current session info
  static getCurrentSession() {
    const sessionId = sessionStorage.getItem('sessionId');
    return {
      sessionId: sessionId,
      isAuthenticated: this.isAuthenticated(),
      role: this.getUserRole(),
      email: this.getUserEmail(),
      name: this.getUserName()
    };
  }

  // Get all active sessions (from all tabs)
  static getActiveSessions() {
    return JSON.parse(localStorage.getItem('activeSessions') || '{}');
  }

  // Check if current user is admin
  static isAdmin() {
    return this.getUserRole() === 'admin';
  }

  // Check if current user is coordinator
  static isCoordinator() {
    return this.getUserRole() === 'coordinator';
  }

  // Check if current user is regular user
  static isUser() {
    return this.getUserRole() === 'user';
  }

  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  // Update user role (admin only)
  static async updateUserRole(userId, newRole) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user role');
      }

      return data;
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }
}

export default AuthService;