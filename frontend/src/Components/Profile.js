import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';
import './Profile.css';
import CustomAlert from './CustomAlert';

// Add axios default configuration
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [sessionInfo, setSessionInfo] = useState({
    sessionId: '',
    loginTime: '',
    tabId: '',
    lastActivity: ''
  });
  const [signupDetails, setSignupDetails] = useState({
    studentId: '',
    department: ''
  });
  const [stats, setStats] = useState({
    eventsRegistered: 0,
    eventsAttended: 0,
    upcomingEvents: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    studentId: '',
    department: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log('Checking authentication...');
        if (!AuthService.isAuthenticated()) {
          console.log('User not authenticated, redirecting to login');
          navigate('/login');
          return;
        }

        // Get current session info
        const sessionData = AuthService.getCurrentSession();
        console.log('Current session:', sessionData);

        if (!sessionData.email) {
          console.log('No email in session, redirecting to login');
          setAlert({
            show: true,
            message: 'Session expired. Please login again.',
            type: 'error'
          });
          navigate('/login');
          return;
        }

        try {
          // Fetch user details
          console.log('Fetching user details for:', sessionData.email);
          const userResponse = await axios.get(`/api/users/details/${sessionData.email}`);
          console.log('User details response:', userResponse.data);

          if (userResponse.data.success) {
            const userData = userResponse.data;
            setUserDetails({
              firstName: userData.firstName || sessionData.name.split(' ')[0],
              lastName: userData.lastName || sessionData.name.split(' ')[1] || '',
              email: userData.email || sessionData.email,
              mobile: userData.mobile || '',
              role: userData.role || sessionData.role
            });
            // fetch signup details if available
            setSignupDetails({
              studentId: userData.studentId || '',
              department: userData.department || ''
            });
            // initialize edit form
            setEditForm({
              firstName: userData.firstName || sessionData.name.split(' ')[0],
              lastName: userData.lastName || sessionData.name.split(' ')[1] || '',
              mobile: userData.mobile || '',
              studentId: userData.studentId || '',
              department: userData.department || ''
            });
          } else {
            throw new Error('Failed to fetch user details');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          // Use session data as fallback
          setUserDetails({
            firstName: sessionData.name.split(' ')[0],
            lastName: sessionData.name.split(' ')[1] || '',
            email: sessionData.email,
            mobile: '',
            role: sessionData.role
          });
        }

        // Get current session information
        const currentSession = AuthService.getCurrentSession();
        const loginTime = sessionStorage.getItem('loginTime');
        
        setSessionInfo({
          sessionId: currentSession.sessionId || 'N/A',
          loginTime: loginTime ? new Date(parseInt(loginTime)).toLocaleString() : 'Unknown',
          tabId: AuthService.getSessionId() || 'N/A',
          lastActivity: 'Current'
        });

        // Fetch stats for the user regardless of role
        try {
          const statsResp = await axios.get(`/api/users/stats/${sessionData.email}`);
          if (statsResp.data) {
            setStats(statsResp.data);
          }
        } catch (e) {
          console.error('Failed to fetch stats', e);
        }

      } catch (error) {
        console.error('Error details:', error);
        
        let errorMessage = 'Error loading profile details. Please try again later.';
        let shouldRedirect = false;

        if (error.response) {
          console.log('Error response:', error.response);
          
          switch (error.response.status) {
            case 401:
              errorMessage = 'Your session has expired. Please login again.';
              shouldRedirect = true;
              break;
            case 404:
              errorMessage = 'User profile not found. Please complete your registration.';
              break;
            case 403:
              errorMessage = 'You do not have permission to access this profile.';
              shouldRedirect = true;
              break;
            default:
              errorMessage = error.response.data?.message || errorMessage;
          }
        }

        setAlert({
          show: true,
          message: errorMessage,
          type: 'error'
        });

        if (shouldRedirect) {
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return { background: '#FED7D7', color: '#C53030' };
      case 'coordinator':
        return { background: '#C6F6D5', color: '#2F855A' };
      default:
        return { background: '#EBF8FF', color: '#2B6CB0' };
    }
  };

  const openEdit = () => {
    setIsEditing(true);
  };

  const cancelEdit = () => {
    // reset edit form to current state
    setEditForm({
      firstName: userDetails.firstName || '',
      lastName: userDetails.lastName || '',
      mobile: userDetails.mobile || '',
      studentId: signupDetails.studentId || '',
      department: signupDetails.department || ''
    });
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();

    const userId = AuthService.getUserId();
    if (!userId) {
      setAlert({ show: true, message: 'Unable to identify user. Please login again.', type: 'error' });
      return;
    }

    try {
      const payload = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        mobile: editForm.mobile,
        studentId: editForm.studentId,
        department: editForm.department
      };

      const resp = await axios.put(`/api/users/${userId}`, payload);
      if (resp.data && resp.data.success) {
        // update local state
        setUserDetails(prev => ({ ...prev, firstName: payload.firstName, lastName: payload.lastName, mobile: payload.mobile }));
        setSignupDetails({ studentId: payload.studentId, department: payload.department });

        // update session storage name
        const fullName = `${payload.firstName} ${payload.lastName}`.trim();
        try {
          sessionStorage.setItem('userName', fullName);
        } catch (err) {
          console.warn('Failed to update sessionStorage userName', err);
        }

        setAlert({ show: true, message: 'Profile updated successfully', type: 'success' });
        setIsEditing(false);
      } else {
        throw new Error(resp.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update failed', err);
      setAlert({ show: true, message: err.response?.data?.message || err.message || 'Update failed', type: 'error' });
    }
  };

  if (!userDetails) {
    return (
      <div className="profile-container">
        <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner"></div>
          <p>Loading profile information...</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Please wait while we fetch your details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {alert.show && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your account details and view your event history</p>
        <div className="profile-user-name">{userDetails.firstName} {userDetails.lastName}</div>
        <div className="profile-meta">
          <span className="profile-email">{userDetails.email}</span>
          <span className="header-role-badge" style={getRoleBadgeColor(userDetails.role)}>
            {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
          </span>
        </div>

        {/* Login details summary */}
        <div className="login-details">
          <div className="login-detail-item">
            <span className="login-label">Logged in as</span>
            <span className="login-value">{userDetails.email}</span>
          </div>
          <div className="login-detail-item">
            <span className="login-label">Login time</span>
            <span className="login-value">{sessionInfo.loginTime}</span>
          </div>
          <div className="login-detail-item">
            <span className="login-label">Session ID</span>
            <span className="login-value monospace">{sessionInfo.sessionId}</span>
          </div>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-section">
          <h2 className="section-title">
            <i className="fas fa-user"></i>
            Personal Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{userDetails.firstName} {userDetails.lastName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{userDetails.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mobile</span>
              <span className="info-value">{userDetails.mobile}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Student ID</span>
              <span className="info-value">{signupDetails.studentId || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Department</span>
              <span className="info-value">{signupDetails.department || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="role-badge" style={getRoleBadgeColor(userDetails.role)}>
                {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">
            <i className="fas fa-graduation-cap"></i>
            Academic Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Student ID</span>
              <span className="info-value">{signupDetails.studentId || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Department</span>
              <span className="info-value">{signupDetails.department || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">
            <i className="fas fa-key"></i>
            Current Session Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Session ID</span>
              <span className="info-value session-id">{sessionInfo.sessionId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Login Time</span>
              <span className="info-value">{sessionInfo.loginTime}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tab ID</span>
              <span className="info-value session-id">{sessionInfo.tabId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="status-badge active">Active</span>
            </div>
          </div>
        </div>

      </div>

      <div className="profile-edit-area">
        {!isEditing ? (
          <button className="edit-profile-btn" onClick={openEdit}>
            <i className="fas fa-edit"></i>
            Edit Profile
          </button>
        ) : (
          <form className="edit-profile-form" onSubmit={submitProfileUpdate}>
            <div className="form-row">
              <label>First Name</label>
              <input name="firstName" value={editForm.firstName} onChange={handleEditChange} />
            </div>
            <div className="form-row">
              <label>Last Name</label>
              <input name="lastName" value={editForm.lastName} onChange={handleEditChange} />
            </div>
            <div className="form-row">
              <label>Mobile</label>
              <input name="mobile" value={editForm.mobile} onChange={handleEditChange} />
            </div>
            <div className="form-row">
              <label>Student ID</label>
              <input name="studentId" value={editForm.studentId} onChange={handleEditChange} />
            </div>
            <div className="form-row">
              <label>Department</label>
              <input name="department" value={editForm.department} onChange={handleEditChange} />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" className="cancel-btn" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        )}
      </div>
      <div className="profile-section" style={{ marginTop: '1.5rem' }}>
        <h2 className="section-title">
          <i className="fas fa-chart-line"></i>
          Event Statistics
        </h2>
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.eventsRegistered}</div>
            <div className="stat-label">Events Registered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.eventsAttended}</div>
            <div className="stat-label">Events Attended</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.upcomingEvents}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
