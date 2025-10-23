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
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
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
  // Note: auth and registration are handled by the backend via AuthService

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign-up form validation
        if (firstName && lastName && mobile && email && password) {
          // Send registration request to backend
          try {
            const registerData = {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              mobile: mobile.trim(),
              studentId: studentId.trim(),
              department: department.trim(),
              email: email.trim().toLowerCase(),
              password: password
            };

            const res = await AuthService.register(registerData);
            // AuthService.register throws on failure, so if we reach here it's OK
            setIsSignUp(false); // switch to login mode
            setError('');
            // Optionally auto-login after signup
            try {
              await AuthService.login(registerData.email, registerData.password);
              navigate('/home', { replace: true });
              return;
            } catch (loginAfterRegisterErr) {
              // Registration succeeded but auto-login failed; ask user to login manually
              setError('Registration successful. Please log in.');
            }
          } catch (regErr) {
            console.error('Registration error:', regErr);
            setError(regErr.message || 'Registration failed.');
          } finally {
            // Clear sensitive fields but keep email for convenience
            setPassword('');
            setFirstName('');
            setLastName('');
            setMobile('');
            setStudentId('');
            setDepartment('');
          }
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

        try {
          const data = await AuthService.login(email.trim().toLowerCase(), password);
          // AuthService.login sets session data on success
          navigate('/home', { replace: true });
        } catch (loginErr) {
          console.error('Login failed:', loginErr);
          setError(loginErr.message || 'Login failed. Please check your credentials.');
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
              <input
                type="text"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
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
