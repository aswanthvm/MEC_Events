// HomePage.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './HomePage.css'; // Import the CSS for HomePage styling
import bgvideo from '../Assets/bgvideo.mp4';

const HomePage = () => {
  const heroRef = useRef(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch upcoming events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const events = response.data;
        
        // Filter and sort upcoming events
        const currentDate = new Date();
        const upcoming = events
          .filter(event => new Date(event.date) >= currentDate)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 4); // Get only 4 upcoming events
        
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Set empty array on error
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage">
      <header className="hero-section" ref={heroRef}>
        <video className="background-video" autoPlay muted loop>
          <source src={bgvideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-content animate-on-scroll">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to MEC Events</h1>
            <p className="hero-subtitle">Discover, manage, and attend events at MEC. Your one-stop platform for all things events.</p>
            <div className="hero-buttons">
              <a href="/events" className="cta-button primary">Explore Events</a>
            </div>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-arrow"></div>
          </div>
        </div>
      </header>


      <section className="events-section animate-on-scroll">
        <div className="section-header">
          <h2 className="section-title">Upcoming Events</h2>
          <p className="section-subtitle">Don't miss out on these exciting upcoming events at MEC</p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading upcoming events...</p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="events-cards">
            {upcomingEvents.map((event, index) => (
              <div key={event._id} className="event-card animate-on-scroll" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="event-image-container">
                  <img 
                    src={event.image || 'https://via.placeholder.com/400x250/667eea/ffffff?text=Event+Image'} 
                    alt={event.title} 
                    className="event-image"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.src = 'https://via.placeholder.com/400x250/667eea/ffffff?text=Event+Image';
                    }}
                  />
                  <div className="event-overlay">
                    <div className="event-date">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="event-description">
                    {event.description.length > 100 
                      ? `${event.description.substring(0, 100)}...` 
                      : event.description}
                  </p>
                  <div className="event-tags">
                    {event.category && <span className="tag">{event.category}</span>}
                    {event.prize && <span className="tag prize">Prize: {event.prize}</span>}
                  </div>
                  <a href="/events" className="event-button">View Details</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events-container">
            <div className="no-events-icon">📅</div>
            <h3>No Upcoming Events</h3>
            <p>There are no upcoming events at the moment. Check back soon for exciting new events!</p>
            <a href="/events" className="cta-button primary">View All Events</a>
          </div>
        )}
      </section>
    
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CollegeEventHub</h3>
            <p>Your gateway to amazing college experiences and professional networking opportunities.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/events">Events</a></li>
              <li><a href="/register">Register</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="https://www.facebook.com/excelmec/" className="social-link" target="_blank" rel="noopener noreferrer">f</a>
              <a href="https://www.instagram.com/excelmec/" className="social-link" target="_blank" rel="noopener noreferrer">@</a>
              <a href="https://www.linkedin.com/company/excelmec/posts/?feedView=all" className="social-link" target="_blank" rel="noopener noreferrer">in</a>
              <a href="https://x.com/excelmec?t=hgaB719EfkRD0YZz3cKHxA&s=09" className="social-link" target="_blank" rel="noopener noreferrer">#</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
