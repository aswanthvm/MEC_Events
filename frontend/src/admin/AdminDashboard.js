import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import { FaCalendarAlt, FaChartBar } from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Administration Panel</h1>
        <p className="dashboard-subtitle">Manage college events and generate reports</p>
      </div>

      <div className="dashboard-cards">
        <Link to="/manage-events" className="dashboard-card">
          <div className="card-icon">
            <FaCalendarAlt />
          </div>
          <div className="card-content">
            <h2>Event Management</h2>
            <p>Create and manage events, track registrations, and handle event logistics efficiently.</p>
          </div>
        </Link>
        <Link to="/manage-reports" className="dashboard-card">
          <div className="card-icon">
            <FaChartBar />
          </div>
          <div className="card-content">
            <h2>Reports & Analytics</h2>
            <p>Access comprehensive reports, analyze event performance, and track attendance statistics.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
