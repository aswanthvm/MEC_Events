// Login.js
import React, { useState, useEffect } from 'react';
import './Login.css'; // Import your CSS file for styling
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and sign-up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already authenticated and manage body class
  useEffect(() => {
    // Add login-page class when component mounts
    document.body.classList.add('login-page');

    if (AuthService.isAuthenticated()) {
      const role = AuthService.getUserRole();
      console.log('User already authenticated with role:', role);
      // Redirect based on role
      navigate(role === 'admin' ? '/home' : '/home', { replace: true });
    }

    // Remove login-page class when component unmounts
    return () => {
      document.body.classList.remove('login-page');
    };
  }, [navigate]);

  // Hardcoded credentials (for demo - should be in database in production)
  const ADMIN_EMAIL = 'admin@mec.ac.in';
  const ADMIN_PASSWORD = 'admin123';
  
  // Multiple coordinator accounts
  const COORDINATORS = [
    { email: 'coordinator1@mec.ac.in', password: 'coord123', name: 'Coordinator_1' },
    { email: 'coordinator2@mec.ac.in', password: 'coord456', name: 'Coordinator_2' },
    { email: 'coordinator3@mec.ac.in', password: 'coord789', name: 'Coordinator_3' },
    { email: 'coordinator4@mec.ac.in', password: 'coord101', name: 'Coordinator_4' },
    { email: 'coordinator5@mec.ac.in', password: 'coord202', name: 'Coordinator_5' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign-up form validation
        if (firstName && lastName && mobile && email && password) {
          // Here you could also send user data to a server
          alert('Sign-up successful! Please log in.'); 
          setIsSignUp(false); // Set back to log-in mode
          // Clear form fields
          setFirstName('');
          setLastName('');
          setMobile('');
          setEmail('');
          setPassword('');
        } else {
          setError('Please fill in all fields.');
        }
      } else {
        // Log-in form validation
        if (!email || !password) {
          setError('Please fill in both email and password.');
          setLoading(false);
          return;
        }

        let userRole = null;

        // Check for admin credentials
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          userRole = AuthService.setAuthData({
            role: 'admin',
            email: email,
            name: 'Admin'
          });
          console.log('Admin login successful');
        }
        // Check for coordinator credentials
        else {
          const coordinator = COORDINATORS.find(coord => 
            coord.email === email && coord.password === password
          );
          
          if (coordinator) {
            userRole = AuthService.setAuthData({
              role: 'coordinator',
              email: email,
              name: coordinator.name,
              coordinatorName: coordinator.name
            });
            console.log('Coordinator login successful:', coordinator.name);
          }
          // Regular user login
          else {
            userRole = AuthService.setAuthData({
              role: 'user',
              email: email,
              name: 'User'
            });
            console.log('User login successful');
          }
        }

        if (userRole) {
          // Show success message
          const userName = userRole === 'admin' ? 'Admin' : 
                          userRole === 'coordinator' ? COORDINATORS.find(c => c.email === email)?.name : 
                          'User';
          alert(`Welcome ${userName}!`);
          
          // Navigate to home page for all roles
          navigate('/home', { replace: true });
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isSignUp ? 'Sign Up' : 'Log In'}</h1>
        {error && <div className="error-message" style={{color: 'red', marginBottom: '10px', textAlign: 'center'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>
        <p>
          {isSignUp
            ? 'Already have an account? '
            : "Don't have an account? "}
          <span
            className="toggle-auth"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
