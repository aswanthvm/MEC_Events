import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageEvents.css'; // Import the CSS file for styling

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [editedEvent, setEditedEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [prize, setPrize] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchEvents();
    
    // Add paste event listener
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
              alert('File size must be less than 5MB');
              return;
            }
            
            setImageFile(file);
            
            // Create preview using FileReader
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result);
              // Clear URL input when image is pasted
              setImage('');
            };
            reader.onerror = () => {
              alert('Error reading pasted image');
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    
    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const fetchEvents = async () => {
    const response = await axios.get('http://localhost:5000/api/events');
    setEvents(response.data);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG, GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Clear URL input when file is selected
        setImage('');
      };
      reader.onerror = () => {
        alert('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImage(url);
    
    if (url) {
      // Clear file input when URL is entered
      setImageFile(null);
      setImagePreview(url);
    } else {
      setImagePreview('');
    }
  };

  // Upload image to server (Alternative 1: Server Upload)
  const uploadImageToServer = async () => {
    if (!imageFile) return null;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post('http://localhost:5000/api/events/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      setUploading(false);
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Processing..');
      setUploading(false);
      return null;
    }
  };

  // Convert image to base64 (Alternative 2: Base64 Storage)
  const convertToBase64 = () => {
    if (!imageFile) return null;
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(imageFile);
    });
  };

  const handleEdit = (event) => {
    setEditedEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setDescription(event.description);
    setImage(event.image);
    setPrize(event.prize);
    setImagePreview(event.image);
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/events/${id}`);
    fetchEvents(); // Refresh the list
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    let finalImageUrl = image;
    
    // Handle image upload/conversion
    if (imageFile) {
      setUploading(true);
      
      // Try server upload first
      const uploadedUrl = await uploadImageToServer();
      
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        // Fallback to base64 if server upload fails
        const base64Image = await convertToBase64();
        if (base64Image) {
          finalImageUrl = base64Image;
        }
      }
      setUploading(false);
    }

    // Validate that we have an image
    if (!finalImageUrl) {
      alert('Please provide an image file or URL');
      return;
    }

    const updatedEvent = { title, date, description, image: finalImageUrl, prize };

    try {
      await axios.put(`http://localhost:5000/api/events/${editedEvent._id}`, updatedEvent);
      alert('Event updated successfully!');
      setEditedEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    let finalImageUrl = image;
    
    // Handle image upload/conversion
    if (imageFile) {
      setUploading(true);
      
      // Try server upload first
      const uploadedUrl = await uploadImageToServer();
      
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        // Fallback to base64 if server upload fails
        const base64Image = await convertToBase64();
        if (base64Image) {
          finalImageUrl = base64Image;
        }
      }
      setUploading(false);
    }

    // Validate that we have an image
    if (!finalImageUrl) {
      alert('Please provide an image file or URL');
      return;
    }

    const newEvent = { title, date, description, image: finalImageUrl, prize };

    try {
      await axios.post('http://localhost:5000/api/events', newEvent);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setPrize('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setImagePreview('');
  };

  // Download event booking data as text file
  const handleGetData = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/export/${eventId}`, {
        responseType: 'blob', // Important for handling file downloads
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_${eventId}.txt`); // Download filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="manage-events-container">
      <h3>Create New Event</h3>
      <form className="event-form" onSubmit={handleCreate}>
        <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="date" placeholder="Event Date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input type="text" placeholder="Prizepool" value={prize} onChange={(e) => setPrize(e.target.value)} required />
        <textarea placeholder="Event Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        
        <div className="image-upload-section">
          <h4>Event Image</h4>
          <div className="upload-options">
            <div className="option-tabs">
              <button 
                type="button" 
                className={`tab-button ${!image ? 'active' : ''}`}
                onClick={() => {
                  setImage('');
                  setImagePreview(imageFile ? URL.createObjectURL(imageFile) : '');
                }}
              >
                📁 Upload File
              </button>
              <button 
                type="button" 
                className={`tab-button ${image ? 'active' : ''}`}
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(image);
                }}
              >
                🔗 Use URL
              </button>
            </div>
            
            {!image ? (
              <div className="file-upload-option">
                <label>Select Image File:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="file-input"
                />
                <small>Supported: PNG, JPG, JPEG, GIF (Max 5MB)</small>
                <div className="paste-instruction">
                  <small style={{ color: '#007bff', fontWeight: 'bold' }}>
                    💡 Tip: You can also paste images directly using Ctrl+V
                  </small>
                </div>
                {uploading && <p className="uploading-text">Processing image...</p>}
              </div>
            ) : (
              <div className="url-option">
                <label>Image URL:</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg" 
                  value={image} 
                  onChange={handleUrlChange}
                />
                <small>Paste a direct link to an image</small>
              </div>
            )}
          </div>
          
          {imagePreview && (
            <div className="image-preview">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="preview-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="preview-error" style={{ display: 'none' }}>
                <span>❌ Invalid image URL or file</span>
              </div>
            </div>
          )}
          
          {!imagePreview && (imageFile || image) && (
            <div className="image-preview">
              <div className="preview-loading">
                <span>📷 Image ready to upload</span>
              </div>
            </div>
          )}
        </div>
        
        <button type="submit" className="submit-button" disabled={uploading}>
          {uploading ? 'Creating...' : 'Create Event'}
        </button>
      </form>

      <h3>Current Events</h3>
      <ul className="events-list">
        {events.map((event) => (
          <li key={event._id} className="event-item">
            <h4>{event.title}</h4>
            <p>Date: {event.date}</p>
            <p>Prize: {event.prize}</p>
            <div className="event-image-container">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="event-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="image-placeholder" style={{ display: event.image ? 'none' : 'flex' }}>
                <span>No Image Available</span>
              </div>
            </div>
            <p>{event.description}</p>
            <div className="event-buttons">
              <button onClick={() => handleEdit(event)} className="edit-button">
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(event._id)} className="delete-button">
                🗑️ Delete
              </button>
              <button onClick={() => handleGetData(event._id)} className="data-button">
                📊 Get Data
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Event</h3>
              <button className="close-btn" onClick={() => setEditedEvent(null)}>
                ×
              </button>
            </div>
            
            <form className="event-form" onSubmit={handleUpdate}>
              <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input type="date" placeholder="Event Date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <input type="text" placeholder="Prizepool" value={prize} onChange={(e) => setPrize(e.target.value)} required />
              <textarea placeholder="Event Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              
              <div className="image-upload-section">
                <h4>Event Image</h4>
                <div className="upload-options">
                  <div className="file-upload-option">
                    <label>Upload New Image:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    <div className="paste-instruction">
                      <small style={{ color: '#007bff', fontWeight: 'bold' }}>
                        💡 Tip: You can also paste images directly using Ctrl+V
                      </small>
                    </div>
                    {uploading && <p className="uploading-text">Uploading...</p>}
                  </div>
                  
                  <div className="url-option">
                    <label>Or update Image URL:</label>
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg" 
                      value={image} 
                      onChange={handleUrlChange}
                    />
                  </div>
                </div>
                
                {imagePreview && (
                  <div className="image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="preview-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="preview-error" style={{ display: 'none' }}>
                      <span>❌ Invalid image URL or file</span>
                    </div>
                  </div>
                )}
                
                {!imagePreview && (imageFile || image) && (
                  <div className="image-preview">
                    <div className="preview-loading">
                      <span>📷 Image ready to upload</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="submit-button" disabled={uploading}>
                  {uploading ? 'Updating...' : 'Update Event'}
                </button>
                <button type="button" className="cancel-button" onClick={() => setEditedEvent(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
