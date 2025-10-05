// RoleBasedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const RoleBasedRoute = ({ children, allowedRoles = [], redirectTo = '/home' }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const userRole = AuthService.getUserRole();

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
    // For unauthorized access, always redirect to home
    // The home page will handle role-specific content
    return '/home';
  };

  return <Navigate to={getRoleBasedRedirect()} replace />;
};

export default RoleBasedRoute;