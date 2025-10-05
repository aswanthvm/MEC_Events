import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../Assets/meclogo.png';
import AuthService from '../services/AuthService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Check user roles using AuthService
  const userRole = AuthService.getUserRole();
  const coordinatorName = sessionStorage.getItem('coordinatorName');
  const isAdmin = AuthService.isAdmin();
  const isCoordinator = AuthService.isCoordinator();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle function for the hamburger menu
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  // Check if the link is active by comparing the current path
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="brand">
          <img src={logo} alt="College Logo" className="navbar-logo" />
          <div className="brand-text-container">
            <span className="brand-text">College</span>
            <span className="brand-highlight">Event</span>
            <span className="brand-text">Hub</span>
            {(isAdmin || isCoordinator) && (
              <span className={`role-badge ${userRole}`}>
                {isCoordinator && coordinatorName ? coordinatorName : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
          </div>
        </div>
        
        <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
          <li className="nav-item">
            <NavLink
              to="/home"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-text">Home</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/events"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-text">Events</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/reports"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-text">Reports</span>
            </NavLink>
          </li>
          {(isAdmin || isCoordinator) && (
            <li className="nav-item">
              <NavLink
                to="/booking"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-text">Booking</span>
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li className="nav-item">
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-text">Dashboard</span>
              </NavLink>
            </li>
          )}
          <li className="nav-item profile-item">
            <NavLink
              to="/logout"
              className={({ isActive }) => `nav-link profile-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-text">Profile</span>
            </NavLink>
          </li>
        </ul>

        <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={handleToggle}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
