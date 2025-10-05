// src/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>🎯 Admin Dashboard</h1>
      <div className="dashboard-cards">
        <Link to="/manage-events" className="dashboard-card">
          <i className="fas fa-calendar-alt"></i>
          <h2>Manage Events</h2>
          <p>Create, edit, and organize college events. Upload images, set dates, and track event details with our comprehensive event management system.</p>
        </Link>
        <Link to="/manage-reports" className="dashboard-card">
          <i className="fas fa-chart-bar"></i>
          <h2>Manage Reports</h2>
          <p>Generate detailed reports for events including attendance rates, feedback scores, and performance analytics to improve future events.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
