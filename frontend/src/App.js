import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './Components/HomePage';
import EventList from './Components/EventList';
import Reports from './Components/Reports';
import Booking from './Components/Booking';
import Logout from './Components/Logout';
import Login from './Components/Login';
import ProtectedRoute from './Components/ProtectedRoute';
import RoleBasedRoute from './Components/RoleBasedRoute';
import RoleBasedRedirect from './Components/RoleBasedRedirect';
import Navbar from './Components/Navbar';
import SessionMonitor from './Components/SessionMonitor';
import AdminDashboard from './admin/AdminDashboard'; // Import Admin Dashboard
import ManageEvents from './admin/ManageEvents';     // Import Manage Events
import ManageReports from './admin/ManageReports';   // Import Manage Reports
import EventDetails from './Components/EventDetails';   // Import Event Details

function App() {
  return (
    <Router>
      <SessionMonitor>
        <div className="App">
          <Routes>
          {/* Default route - always show login page */}
          <Route path="/" element={<Login />} />

          {/* Login Route */}
          <Route path="/login" element={<Login />} /> 

          {/* Protected Routes */}
          <Route 
            path="/home" 
            element={
              <RoleBasedRoute allowedRoles={['user', 'coordinator', 'admin']}>
                <Navbar />
                <HomePage />
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/events" 
            element={
              <RoleBasedRoute>
                <Navbar />
                <EventList />
              </RoleBasedRoute>
            } 
          />

          <Route
            path="/events/:id"
            element={
              <RoleBasedRoute>
                <Navbar />
                <EventDetails />
              </RoleBasedRoute>
            }
          />

          <Route 
            path="/reports" 
            element={
              <RoleBasedRoute>
                <Navbar />
                <Reports />
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/booking" 
            element={
              <RoleBasedRoute allowedRoles={['admin', 'coordinator']}>
                <Navbar />
                <Booking />
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/logout" 
            element={
              <RoleBasedRoute>
                <Navbar />
                <Logout />
              </RoleBasedRoute>
            } 
          />

          {/* Admin Dashboard */}
          <Route 
            path="/admin" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <Navbar />
                <AdminDashboard />
              </RoleBasedRoute>
            } 
          />

          {/* Manage Events - Accessed via Admin Dashboard */}
          <Route 
            path="/manage-events" 
            element={
              <RoleBasedRoute allowedRoles={['admin', 'coordinator']}>
                <Navbar />
                <ManageEvents />
              </RoleBasedRoute>
            } 
          />

          {/* Manage Reports - Accessed via Admin Dashboard */}
          <Route 
            path="/manage-reports" 
            element={
              <RoleBasedRoute allowedRoles={['admin', 'coordinator']}>
                <Navbar />
                <ManageReports />
              </RoleBasedRoute>
            } 
          />
          </Routes>
        </div>
      </SessionMonitor>
    </Router>
  );
}

export default App;
