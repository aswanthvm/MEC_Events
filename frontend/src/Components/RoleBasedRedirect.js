// RoleBasedRedirect.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'coordinator':
      return <Navigate to="/home" replace />;
    case 'user':
      return <Navigate to="/home" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;