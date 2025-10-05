// src/Components/RegistrationForm.js
import React, { useState } from 'react';
import './RegistrationForm.css'; // Add styles for the form

const RegistrationForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    department: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const requiredFields = ['name', 'studentId', 'department', 'phone', 'email'];
    const emptyFields = requiredFields.filter(field => !formData[field].trim());
    
    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting form data:', formData);
      await onSubmit(formData);
      console.log('Form submitted successfully');
      // Reset form after successful submission
      setFormData({
        name: '',
        studentId: '',
        department: '',
        phone: '',
        email: '',
      });
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to submit registration. Please try again.');
      return; // Don't close form on error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Event Registration</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required />
          <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          {error && <p className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
