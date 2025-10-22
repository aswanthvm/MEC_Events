import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './EventDetails.css';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="event-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/events')} className="back-button">
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-not-found">
        <h2>Event Not Found</h2>
        <p>The event you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/events')} className="back-button">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-details-card">
        <div className="event-image-container">
          <img
            src={event.image || 'https://via.placeholder.com/800x400/667eea/ffffff?text=Event+Image'}
            alt={event.title}
            className="event-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400/667eea/ffffff?text=Event+Image';
            }}
          />
          <div className="event-date-badge">
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
        <div className="event-details-content">
          <h1>{event.title}</h1>
          <div className="event-tags">
            {event.category && <span className="tag">{event.category}</span>}
            {event.prize && <span className="tag prize">Prize: {event.prize}</span>}
          </div>
          <div className="event-description">
            <p>{event.description}</p>
          </div>
          <div className="event-actions">
            <Link to={`/booking/${event._id}`} className="register-button">
              Register Now
            </Link>
            <button onClick={() => navigate('/events')} className="back-button">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;