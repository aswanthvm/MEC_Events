import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Reports.css';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaUserPlus, 
  FaUserCheck, 
  FaStar
} from 'react-icons/fa';

const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reports');
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const getAttendanceRate = (checkIns, registrations) => {
    if (registrations === 0) return 0;
    return Math.round((checkIns / registrations) * 100);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Event Reports Dashboard</h2>
      </div>

      <div className="reports-grid">
        {reports.length > 0 ? (
          reports.map(report => (
            <div key={report._id} className="report-card">
              <h3>{report.eventName || 'Unnamed Event'}</h3>
              
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
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No Reports Available</h3>
            <p>No event reports have been created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
