// src/Components/Booking.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Booking.css'; // Add some custom styling for the booking section

const Booking = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/bookings')
      .then((response) => {
        setBookings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching bookings:', error);
      });
  }, []);

  return (
    <div className="bookings-page">
      {/* Header Section */}
      <div className="bookings-header">
        <div className="header-content">
          <h1 className="bookings-title">Event Bookings</h1>
          <p className="bookings-subtitle">View all event registrations and participant details</p>
        </div>
      </div>

      {/* Bookings Container */}
      <div className="bookings-container">
        {bookings.length > 0 ? (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-content">
                  <h3 className="booking-event-title">{booking.eventTitle}</h3>
                  <div className="booking-info">
                    <p><i className="fas fa-calendar-alt"></i> <strong>Date:</strong> {new Date(booking.eventDate).toDateString()}</p>
                    <p><i className="fas fa-user"></i> <strong>Name:</strong> {booking.name}</p>
                    <p><i className="fas fa-id-card"></i> <strong>Student ID:</strong> {booking.studentId}</p>
                    <p><i className="fas fa-graduation-cap"></i> <strong>Department:</strong> {booking.department}</p>
                    <p><i className="fas fa-envelope"></i> <strong>Email:</strong> {booking.email}</p>
                    <p><i className="fas fa-phone"></i> <strong>Phone:</strong> {booking.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <h2 className="no-bookings-title">No Bookings Yet</h2>
            <p className="no-bookings-message">You haven't registered for any events yet. Browse our events page to find exciting opportunities!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
