import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageReports.css';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaUserPlus, 
  FaUserCheck, 
  FaStar,
  FaPlus,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const [newReport, setNewReport] = useState({ 
    eventName: '', 
    date: '', 
    location: '', 
    coordinator: '', 
    registrations: 0, 
    checkIns: 0, 
    feedbackScore: 0 
  });

  useEffect(() => {
    // Test backend connectivity first, then fetch reports
    const initializeComponent = async () => {
      const isConnected = await testBackendConnection();
      setBackendStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected) {
        await fetchReports();
      }
    };
    
    initializeComponent();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      
      // Test main server health
      const healthResponse = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
      console.log('✅ Main server health:', healthResponse.data);
      
      // Test reports endpoint health
      const reportsHealthResponse = await axios.get('http://localhost:5000/api/reports/health', { timeout: 5000 });
      console.log('✅ Reports API health:', reportsHealthResponse.data);
      
      return true;
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      
      if (error.code === 'ECONNREFUSED') {
        alert('❌ Cannot connect to backend server.\n\nPlease:\n1. Open terminal in backend folder\n2. Run: node index.js\n3. Make sure MongoDB is connected');
        return false;
      } else if (error.code === 'ECONNABORTED') {
        alert('⏱️ Connection timeout. Backend server might be slow to respond.');
        return false;
      } else {
        console.error('Connection test error details:', error.message);
        return false;
      }
    }
  };

  const fetchReports = async () => {
    try {
      console.log('Fetching reports from backend...');
      const res = await axios.get('http://localhost:5000/api/reports');
      console.log('Reports fetched successfully:', res.data.length, 'reports');
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
      } else if (error.request) {
        console.error('Network error - backend may not be running');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!newReport.eventName.trim() || !newReport.date || !newReport.location.trim() || !newReport.coordinator.trim()) {
      alert('Please fill in all required fields: Event Name, Date, Location, and Coordinator');
      return;
    }

    if (parseInt(newReport.checkIns) > parseInt(newReport.registrations)) {
      alert('Check-ins cannot be greater than registrations');
      return;
    }

    if (newReport.feedbackScore < 0 || newReport.feedbackScore > 5) {
      alert('Feedback score must be between 0 and 5');
      return;
    }

    try {
      console.log('Submitting report data:', newReport);
      console.log('Backend URL:', editingReport ? 
        `http://localhost:5000/api/reports/${editingReport._id}` : 
        'http://localhost:5000/api/reports'
      );
      
      let response;
      if (editingReport) {
        response = await axios.put(`http://localhost:5000/api/reports/${editingReport._id}`, newReport);
        console.log('Report updated successfully:', response.data);
      } else {
        // Try the standard route first
        try {
          response = await axios.post('http://localhost:5000/api/reports', newReport);
          console.log('Report created successfully:', response.data);
        } catch (standardError) {
          console.warn('Standard route failed, trying direct bypass route...');
          // If standard route fails with validation error, try the direct route
          response = await axios.post('http://localhost:5000/api/reports/create-direct', newReport);
          console.log('Report created via direct route:', response.data);
        }
      }
      
      fetchReports();
      resetForm();
      alert(`Report ${editingReport ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving report:', error);
      
      let errorMessage = 'Error saving report. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        if (serverError.message) {
          errorMessage = serverError.message;
        }
        if (serverError.details && Array.isArray(serverError.details)) {
          const fieldErrors = serverError.details.map(detail => `${detail.field}: ${detail.message}`).join('\n');
          errorMessage += '\n\nField errors:\n' + fieldErrors;
        }
        
        // Special handling for validation errors
        if (serverError.message && serverError.message.includes('validation failed')) {
          errorMessage = 'Validation error detected. This suggests database schema conflicts. Please try using the "Reset DB" button to fix this issue.';
        }
        
        console.error('Server error details:', serverError);
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 5000.';
        console.error('Network error:', error.request);
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setNewReport({
      eventName: report.eventName || '',
      date: report.date || '',
      location: report.location || '',
      coordinator: report.coordinator || '',
      registrations: report.registrations || 0,
      checkIns: report.checkIns || 0,
      feedbackScore: report.feedbackScore || 0
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reports/${id}`);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Error deleting report. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setNewReport({ 
      eventName: '', 
      date: '', 
      location: '', 
      coordinator: '', 
      registrations: 0, 
      checkIns: 0, 
      feedbackScore: 0 
    });
    setShowCreateForm(false);
    setEditingReport(null);
  };

  const getAttendanceRate = (checkIns, registrations) => {
    if (registrations === 0) return 0;
    return Math.round((checkIns / registrations) * 100);
  };

  const handleMigration = async () => {
    if (window.confirm('This will delete all old reports that don\'t match the new format. Are you sure?')) {
      try {
        const res = await axios.post('http://localhost:5000/api/reports/migrate');
        alert(res.data.message);
        fetchReports();
      } catch (error) {
        console.error('Error during migration:', error);
        alert('Error during migration. Please try again.');
      }
    }
  };

  const handleResetCollection = async () => {
    if (window.confirm('⚠️ WARNING: NUCLEAR OPTION\n\nThis will:\n✓ Drop the entire reports collection\n✓ Clear all Mongoose caches\n✓ Create a fresh schema\n✓ Delete ALL existing reports\n\nThis action CANNOT be undone!\n\nProceed?')) {
      try {
        console.log('🚀 Starting database reset...');
        
        // First test if backend is reachable
        const isConnected = await testBackendConnection();
        if (!isConnected) {
          alert('❌ Cannot connect to backend. Please start the backend server first.');
          return;
        }
        
        // Show loading state
        const originalText = document.querySelector('[title="Reset entire reports database"]').textContent;
        document.querySelector('[title="Reset entire reports database"]').textContent = '🔄 Resetting...';
        
        const res = await axios.post('http://localhost:5000/api/reports/reset-collection', {}, {
          timeout: 30000 // 30 second timeout for reset operation
        });
        
        console.log('✅ Reset successful:', res.data);
        
        if (res.data.success) {
          alert(`🎉 Database reset successful!\n\n✅ ${res.data.message}\n\n📊 Test report created: ${res.data.testReport?.eventName || 'N/A'}`);
          
          // Wait a moment then refresh the reports
          setTimeout(() => {
            fetchReports();
          }, 1000);
        } else {
          throw new Error(res.data.message || 'Reset failed');
        }
        
      } catch (error) {
        console.error('❌ Error resetting collection:', error);
        
        let errorMessage = 'Database reset failed.\n\n';
        
        if (error.code === 'ECONNREFUSED') {
          errorMessage += '❌ Cannot connect to backend server.\nPlease make sure the backend is running.';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage += '⏱️ Reset operation timed out.\nThe database might be slow to respond.';
        } else if (error.response?.data) {
          errorMessage += `Server error: ${error.response.data.message || error.response.data.error || 'Unknown error'}`;
        } else {
          errorMessage += `Network error: ${error.message}`;
        }
        
        alert(errorMessage);
      } finally {
        // Restore button text
        const resetButton = document.querySelector('[title="Reset entire reports database"]');
        if (resetButton) {
          resetButton.textContent = '🔄 Reset DB';
        }
      }
    }
  };

  return (
    <div className="manage-reports">
      <div className="reports-header">
        <div className="header-title">
          <h2>📊 Event Reports Dashboard</h2>
          <div className={`status-indicator ${backendStatus}`}>
            {backendStatus === 'checking' && '🔄 Checking connection...'}
            {backendStatus === 'connected' && '✅ Backend Connected'}
            {backendStatus === 'disconnected' && '❌ Backend Disconnected'}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="create-report-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <FaPlus /> Create New Report
          </button>
          <button 
            className="migrate-btn"
            onClick={handleMigration}
            title="Clean up old reports that don't match current format"
          >
            🧹 Clean Data
          </button>
          <button 
            className="migrate-btn danger-btn"
            onClick={handleResetCollection}
            title="⚠️ DANGER: Reset entire reports database - This will delete ALL reports!"
          >
            🔄 Reset DB
          </button>
          <button 
            className="migrate-btn info-btn"
            onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
            title="Test backend API connection"
          >
            🔍 Test API
          </button>
        </div>
      </div>

      {backendStatus === 'disconnected' && (
        <div className="error-banner">
          <div className="error-content">
            <h3>⚠️ Backend Server Not Running</h3>
            <p>The backend server is not responding. Please follow these steps:</p>
            <ol>
              <li>Open a new terminal/command prompt</li>
              <li>Navigate to: <code>D:\my TRASH\College-Event-Management-System\first-app\backend</code></li>
              <li>Run: <code>node index.js</code> (or double-click <code>start-backend.bat</code>)</li>
              <li>Wait for "MongoDB connected" and "Server running on port 5000" messages</li>
              <li>Refresh this page</li>
            </ol>
            <button 
              className="retry-btn"
              onClick={async () => {
                setBackendStatus('checking');
                const isConnected = await testBackendConnection();
                setBackendStatus(isConnected ? 'connected' : 'disconnected');
                if (isConnected) fetchReports();
              }}
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingReport ? '✏️ Edit Report' : '📊 Create New Report'}
              </h3>
              <button className="close-btn" onClick={resetForm}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-group">
                <label className="form-label">Event Name:</label>
                <input
                  type="text"
                  name="eventName"
                  value={newReport.eventName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date:</label>
                <input
                  type="date"
                  name="date"
                  value={newReport.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location:</label>
                <input
                  type="text"
                  name="location"
                  value={newReport.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter event location"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Coordinator:</label>
                <input
                  type="text"
                  name="coordinator"
                  value={newReport.coordinator}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter coordinator name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registrations:</label>
                <input
                  type="number"
                  name="registrations"
                  value={newReport.registrations}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  placeholder="Total registrations"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Check-ins:</label>
                <input
                  type="number"
                  name="checkIns"
                  value={newReport.checkIns}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  max={newReport.registrations || 999999}
                  placeholder="Total check-ins"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Feedback Score:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-input ${star <= newReport.feedbackScore ? 'active' : ''}`}
                      onClick={() => setNewReport(prev => ({ ...prev, feedbackScore: star }))}
                    >
                      <FaStar />
                    </button>
                  ))}
                  <span style={{ marginLeft: '0.5rem', color: '#4a5568' }}>
                    {newReport.feedbackScore}/5
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingReport ? '✅ Update Report' : '🚀 Create Report'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="reports-grid">
        {reports.length > 0 ? (
          reports.map((report, index) => (
            <div key={report._id} className="report-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(report)}
                  title="Edit Report"
                >
                  <FaEdit />
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(report._id)}
                  title="Delete Report"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="report-header">
                <h3>🎉 {report.eventName || 'Unnamed Event'}</h3>
                <div className="attendance-badge">
                  {getAttendanceRate(report.checkIns || 0, report.registrations || 0)}% Attendance
                </div>
              </div>
              
              <div className="report-info">
                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <span className="info-label">Date:</span>
                  <span className="info-value">
                    {report.date ? new Date(report.date).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>

                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <span className="info-label">Location:</span>
                  <span className="info-value">{report.location || 'Not specified'}</span>
                </div>

                <div className="info-item">
                  <FaUserTie className="info-icon" />
                  <span className="info-label">Coordinator:</span>
                  <span className="info-value">{report.coordinator || 'Not specified'}</span>
                </div>

                <div className="info-item">
                  <FaUserPlus className="info-icon" />
                  <span className="info-label">Registrations:</span>
                  <span className="info-value">{report.registrations || 0}</span>
                </div>

                <div className="info-item">
                  <FaUserCheck className="info-icon" />
                  <span className="info-label">Check-ins:</span>
                  <div className="attendance-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${getAttendanceRate(report.checkIns || 0, report.registrations || 0)}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {report.checkIns || 0}/{report.registrations || 0}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Feedback:</span>
                  <div className="feedback-stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < Math.floor(report.feedbackScore || 0) ? '' : 'empty'}`}
                      >
                        <FaStar />
                      </span>
                    ))}
                    <span className="info-value" style={{ marginLeft: '0.5rem' }}>
                      {report.feedbackScore || 0}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : backendStatus === 'connected' ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No Reports Available</h3>
            <p>Start creating reports to track your event performance and analyze attendance data, feedback scores, and success metrics.</p>
            <button 
              className="create-report-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <FaPlus /> Create Your First Report
            </button>
          </div>
        ) : backendStatus === 'checking' ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading Reports...</h3>
            <p>Please wait while we fetch your event reports</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ManageReports;
