// Login.js
import React, { useState } from 'react';
import './Login.css'; // Import your CSS file for styling
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and sign-up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignUp) {
      // Sign-up form validation
      if (firstName && lastName && mobile && email && password) {
        // Here you could also send user data to a server
        alert('Sign-up successful! Please log in.'); 
        setIsSignUp(false); // Set back to log-in mode
        navigate('/login'); // Navigate to login page after sign-up
      } else {
        alert('Please fill in all fields.');
      }
    } else {
      // Log-in form validation
      if (email && password) {
        // Check for admin credentials
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userEmail', email);
          alert('Welcome Admin!');
          navigate('/admin');
          return; // Important: return early to prevent further execution
        }
        
        // Check for coordinator credentials
        const coordinator = COORDINATORS.find(coord => 
          coord.email === email && coord.password === password
        );
        
        if (coordinator) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'coordinator');
          localStorage.setItem('userEmail', email);
          localStorage.setItem('coordinatorName', coordinator.name);
          alert(`Welcome ${coordinator.name}!`);
          navigate('/home');
          return; // Important: return early to prevent further execution
        }
        
        // Regular user login (you can add proper authentication here later)
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('userEmail', email);
        navigate('/home');
      } else {
        alert('Please fill in both fields.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isSignUp ? 'Sign Up' : 'Log In'}</h1>
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
          <button type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
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
