import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Reports.css';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaUserPlus, 
  FaUserCheck, 
  FaStar,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/reports');
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAttendanceRate = (checkIns, registrations) => {
    if (registrations === 0) return 0;
    return Math.round((checkIns / registrations) * 100);
  };

  const renderFeedbackStars = (score) => {
    return (
      <div className="table-stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`star ${i < Math.floor(score || 0) ? 'filled' : 'empty'}`}>
            <FaStar />
          </span>
        ))}
        <span className="score-text">{score || 0}/5</span>
      </div>
    );
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sortedReports = [...reports].sort((a, b) => {
      if (key === 'date') {
        return direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (key === 'registrations' || key === 'checkIns') {
        return direction === 'asc' 
          ? (a[key] || 0) - (b[key] || 0)
          : (b[key] || 0) - (a[key] || 0);
      }
      if (key === 'feedbackScore') {
        return direction === 'asc'
          ? (a.feedbackScore || 0) - (b.feedbackScore || 0)
          : (b.feedbackScore || 0) - (a.feedbackScore || 0);
      }
      return direction === 'asc'
        ? (a[key] || '').localeCompare(b[key] || '')
        : (b[key] || '').localeCompare(a[key] || '');
    });

    setReports(sortedReports);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="sort-icon" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="sort-icon" /> : <FaSortDown className="sort-icon" />;
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Event Reports & Analytics</h2>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('eventName')}>
                  Event Name {renderSortIcon('eventName')}
                </th>
                <th onClick={() => handleSort('date')}>
                  Date {renderSortIcon('date')}
                </th>
                <th onClick={() => handleSort('location')}>
                  Location {renderSortIcon('location')}
                </th>
                <th onClick={() => handleSort('coordinator')}>
                  Coordinator {renderSortIcon('coordinator')}
                </th>
                <th onClick={() => handleSort('registrations')} style={{ textAlign: 'center' }}>
                  Registrations {renderSortIcon('registrations')}
                </th>
                <th onClick={() => handleSort('checkIns')}>
                  Attendance {renderSortIcon('checkIns')}
                </th>
                <th onClick={() => handleSort('feedbackScore')}>
                  Feedback {renderSortIcon('feedbackScore')}
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report._id}>
                  <td className="event-name-cell">{report.eventName || 'Unnamed Event'}</td>
                  <td className="event-date-cell" style={{ maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDate(report.date)}</td>
                  <td style={{ maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.location || 'Not specified'}</td>
                  <td style={{ maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.coordinator || 'Not specified'}</td>
                  <td className="number-cell" style={{ width: '45px' }}>{report.registrations || 0}</td>
                  <td className="attendance-cell">
                    <div className="attendance-info">
                      <span>{report.checkIns || 0}/{report.registrations || 0}</span>
                      <div className="mini-progress">
                        <div 
                          className="mini-progress-fill"
                          style={{ 
                            width: `${getAttendanceRate(report.checkIns || 0, report.registrations || 0)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="feedback-cell">
                    {renderFeedbackStars(report.feedbackScore)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No Reports Available</h3>
          <p>Event reports and analytics will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
