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
        </div>
      </div>

      {/* Bookings Container */}
      <div className="bookings-container">
        {bookings.length > 0 ? (
          <div className="table-responsive">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td data-label="Event">{booking.eventTitle}</td>
                    <td data-label="Date">{new Date(booking.eventDate).toLocaleDateString()}</td>
                    <td data-label="Name">{booking.name}</td>
                    <td data-label="ID">{booking.studentId}</td>
                    <td data-label="Dept">{booking.department}</td>
                    <td data-label="Email">{booking.email}</td>
                    <td data-label="Phone">{booking.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
