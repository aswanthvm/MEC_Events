// src/Components/EventList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RegistrationForm from './RegistrationForm'; // Import the registration form
import './EventList.css'; // Import your improved CSS file

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // To store the selected event
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Customizable categories - can be managed by admin
  const [categories, setCategories] = useState(['all', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Competition']);
  
  // Get unique categories from actual events (dynamically)
  const getEventCategories = () => {
    const eventCategories = [...new Set(events.map(event => event.category).filter(Boolean))];
    return ['all', ...eventCategories.sort()];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if server is running
        await axios.get('http://localhost:5000/api/health');
        console.log('Server is running');
        
        // Now fetch events
        const eventsResponse = await axios.get('http://localhost:5000/api/events');
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error('Server connection error:', error);
        setError('Cannot connect to server. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Handle keyboard events for fullscreen image
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && selectedEvent) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedEvent]);

  // Filter and sort events (upcoming first, closed last)
  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const now = new Date();
      const aIsUpcoming = new Date(a.date) > now;
      const bIsUpcoming = new Date(b.date) > now;
      
      // If one is upcoming and other is past, upcoming comes first
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;
      
      // If both are upcoming or both are past, sort by the selected criteria
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isEventUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  // Handle View Details button click
  const handleViewDetails = (event) => {
    setSelectedEvent(event); // Set the clicked event to display in the modal
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setSelectedEvent(null); // Clear selected event to close modal
  };

  // Handle image click for event details
  const handleImageClick = (e, event) => {
    e.stopPropagation();
    handleViewDetails(event);
  };



  // Handle opening the registration form
  const handleRegisterClick = () => {
    setIsFormOpen(true);
  };

  // Handle closing the registration form
  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  // Handle submitting the registration form
  const handleFormSubmit = async (formData) => {
    try {
      // Log the selected event for debugging
      console.log('Selected Event Details:', {
        selectedEvent,
        id: selectedEvent?._id,
        title: selectedEvent?.title,
        date: selectedEvent?.date
      });

      // Validate event selection
      if (!selectedEvent || !selectedEvent._id) {
        throw new Error('Please select an event to register for');
      }

      // Prepare booking data
      const bookingData = {
        ...formData,
        eventId: selectedEvent._id,
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
      };

      // Log the full booking data being sent
      console.log('Sending Registration Data:', {
        bookingData,
        url: 'http://localhost:5000/api/bookings/',
        method: 'POST'
      });

      // Make the API call
      try {
        // Make the API call with error logging
        console.log('Making API call to register...');
        const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Log the full response
        console.log('Registration API Response:', {
          status: response.status,
          headers: response.headers,
          data: response.data
        });
        
        if (response.data && response.status === 201) {
          console.log('Registration successful:', response.data);
          alert(`Successfully registered for ${selectedEvent.title}!`);
          setIsFormOpen(false);
          setSelectedEvent(null);
          return response.data;
        } else {
          console.warn('Unexpected response:', response);
          throw new Error('Unexpected response from server');
        }
      } catch (apiError) {
        console.error('API Error:', apiError.response || apiError);
        throw new Error(
          apiError.response?.data?.message || 
          apiError.response?.data?.details || 
          'Failed to register. Please try again.'
        );
      }
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  };

  return (
    <div className="events-page">
      {/* Header Section */}
      <div className="events-header">
        <div className="header-content">
          <h1 className="page-title">Upcoming Events</h1>
          <p className="page-subtitle">Discover amazing events happening at our college</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder=" Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              {getEventCategories().map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Count */}
      <div className="events-count">
        <p>{filteredAndSortedEvents.length} event{filteredAndSortedEvents.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <div className="error-message">
            <h3>⚠️ Connection Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      )}

      {/* Events Container */}
      {!loading && !error && (
        <div className="events-container">
          {filteredAndSortedEvents.length > 0 ? (
            filteredAndSortedEvents.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-image-container" onClick={(e) => handleImageClick(e, event)}>
                  <img
                    src={event.image || 'https://via.placeholder.com/400x400/667eea/ffffff?text=Event+Image'}
                    alt={event.title}
                    className="event-image clickable-image"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x400/667eea/ffffff?text=Event+Image'}
                    title="Click to view event details"
                  />
                  <div className="event-overlay">
                  </div>
                </div>
                
                <div className="event-details">
                  {event.category && (
                    <div className="event-category">
                      {event.category}
                    </div>
                  )}
                  
                  <h3 className="event-title">{event.title}</h3>
                  
                  <div className="event-date">
                    <span className="date-icon">📅</span>
                    {formatDate(event.date)}
                  </div>

                  {event.venue && (
                    <div className="event-location">
                      <span className="location-icon">📍</span>
                      {event.venue}
                    </div>
                  )}
                  
                  {event.capacity && (
                    <div className="event-capacity">
                      <span className="capacity-icon">👥</span>
                      {event.capacity} seats
                    </div>
                  )}
                  
                  <p className="event-description">
                    {event.description?.length > 150 
                      ? `${event.description.substring(0, 150)}...` 
                      : event.description
                    }
                  </p>

                  {event.prize && (
                    <div className="event-prize">
                      <span className="prize-icon"></span>
                      Prize: {event.prize}
                    </div>
                  )}
                  
                  <div className="event-actions">
                    <button 
                      className="event-button primary" 
                      onClick={() => handleViewDetails(event)}
                    >
                       View Details
                    </button>
                    <button 
                      className={`event-button ${isEventUpcoming(event.date) ? 'register' : 'disabled'}`}
                      onClick={() => {
                        if (isEventUpcoming(event.date)) {
                          setSelectedEvent(event);
                          setIsFormOpen(true);
                        }
                      }}
                      disabled={!isEventUpcoming(event.date)}
                    >
                      {isEventUpcoming(event.date) ? ' Register' : ' Closed'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <div className="no-events-icon">🔍</div>
              <h3>No events found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Modal for Event Details */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={handleCloseModal}>✕</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-image">
                <img
                  src={selectedEvent.image || 'https://via.placeholder.com/500x300/667eea/ffffff?text=Event+Image'}
                  alt={selectedEvent.title}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/500x300/667eea/ffffff?text=Event+Image'}
                />
                {selectedEvent.prize && (
                  <div className="modal-prize-badge">🏆 {selectedEvent.prize}</div>
                )}
              </div>
              
              <div className="modal-details">
                {selectedEvent.category && (
                  <div className="modal-category">
                    {selectedEvent.category}
                  </div>
                )}
                
                <h2 className="modal-title">{selectedEvent.title}</h2>
                
                <div className="modal-info-grid">
                  <div className="info-item date-time">
                    <span className="info-icon">📅</span>
                    <div>
                      <strong>Date & Time</strong>
                      <p>{formatDate(selectedEvent.date)}</p>
                    </div>
                  </div>
                  
                  {selectedEvent.venue && (
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <div>
                        <strong>Venue</strong>
                        <p>{selectedEvent.venue}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.capacity && (
                    <div className="info-item">
                      <span className="info-icon">👥</span>
                      <div>
                        <strong>Capacity</strong>
                        <p>{selectedEvent.capacity} participants</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.contactEmail && (
                    <div className="info-item">
                      <span className="info-icon">📧</span>
                      <div>
                        <strong>Contact</strong>
                        <p>{selectedEvent.contactEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="description-section">
                  <h4>About This Event</h4>
                  <p>{selectedEvent.description}</p>
                  
                  {selectedEvent.highlights && (
                    <div className="event-highlights-section">
                      <h4>Event Highlights</h4>
                      <ul className="highlights-list">
                        {selectedEvent.highlights.map((highlight, index) => (
                          <li key={index}>✨ {highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEvent.requirements && (
                    <div className="requirements-section">
                      <h4>Requirements</h4>
                      <ul className="requirements-list">
                        {selectedEvent.requirements.map((req, index) => (
                          <li key={index}>📋 {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedEvent.coordinator && (
                    <div className="coordinator-section">
                      <h4>Event Coordinator</h4>
                      <div className="coordinator-info">
                        <span className="coordinator-icon">👤</span>
                        <p>{selectedEvent.coordinator}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  {isEventUpcoming(selectedEvent.date) ? (
                    <button 
                      className="modal-register-button" 
                      onClick={() => {
                        setIsFormOpen(true);
                      }}
                    >
                       Register for Event
                    </button>
                  ) : (
                    <div className="past-event-notice">
                      <span> This event has ended</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {isFormOpen && selectedEvent && (
        <RegistrationForm 
          isOpen={isFormOpen} 
          onClose={handleFormClose} 
          onSubmit={handleFormSubmit} 
        />
      )}


    </div>
  );
};

export default EventList;
