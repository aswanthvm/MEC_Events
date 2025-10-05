// RoleBasedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles = [], redirectTo = '/home' }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific roles are required, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // Redirect based on user role if they don't have access
  const getRoleBasedRedirect = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'coordinator':
        return '/home';
      case 'user':
        return '/home';
      default:
        return '/login';
    }
  };

  return <Navigate to={getRoleBasedRedirect()} replace />;
};

export default RoleBasedRoute;