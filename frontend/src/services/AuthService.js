// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Auth Service
class AuthService {
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

      // Store user data in localStorage
      if (data.success && data.user) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.fullName);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  static logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  // Get current user role
  static getUserRole() {
    return localStorage.getItem('userRole');
  }

  // Get current user email
  static getUserEmail() {
    return localStorage.getItem('userEmail');
  }

  // Get current user ID
  static getUserId() {
    return localStorage.getItem('userId');
  }

  // Get current user name
  static getUserName() {
    return localStorage.getItem('userName');
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