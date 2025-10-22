import React, { useState } from 'react';
import axios from 'axios';
import ImageUploader from './ImageUploader';
import './CreateEvent.css';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [prize, setPrize] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url' or 'file'
  
  // Available categories for admins to choose from
  const availableCategories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Competition', 'Seminar', 'Other'];


  const handleImageUpload = async (imageData) => {
    if (!imageData) {
      setImage('');
      return;
    }

    // If it's a Base64 string, convert to file and upload immediately
    if (imageData.startsWith('data:image/')) {
      try {
        setUploading(true);
        console.log('Processing Base64 image for upload...');
        
        // Convert Base64 to Blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', blob, 'event-image.jpg');
        
        // Upload to backend
        console.log('Uploading image to backend...');
        const uploadResponse = await axios.post('http://localhost:5000/api/events/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Upload response:', uploadResponse.data);
        
        setImage(uploadResponse.data.imageUrl);
        console.log('Image uploaded successfully:', uploadResponse.data.imageUrl);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          alert(`Failed to upload image: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          console.error('No response from server:', error.request);
          alert('Failed to upload image: No response from server. Make sure the backend is running.');
        } else {
          console.error('Error setting up request:', error.message);
          alert(`Failed to upload image: ${error.message}`);
        }
        // Don't store Base64 on error
        setImage('');
      } finally {
        setUploading(false);
      }
    } else {
      // If it's already a URL, use it directly
      setImage(imageData);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value.trim();
    setImage(url);
    if (url) {
      setImageInputMode('url');
    }
  };

  const handleFileInputClick = () => {
    setImageInputMode('file');
    // Clear URL if switching to file mode
    if (image && image.startsWith('http')) {
      setImage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    if (uploading) {
      alert('Please wait for image upload to complete');
      return;
    }

    // Check if image is Base64 and needs to be uploaded first
    if (image && image.startsWith('data:image/')) {
      alert('Please wait for the image to finish uploading before submitting.');
      return;
    }

    const newEvent = { title, date, description, image, prize, category: category || undefined };

    try {
      console.log('Submitting event with data:', newEvent);
      const response = await axios.post('http://localhost:5000/api/events', newEvent);
      console.log(response.data); // Log the response data
      
      alert('Event created successfully!');
      
      // Reset the form fields after submission
      setTitle('');
      setDate('');
      setDescription('');
      setImage('');
      setPrize('');
      setCategory('');
      setImageInputMode('url');
  
    } catch (error) {
      console.error('There was an error creating the event!', error);
      if (error.response && error.response.data) {
        alert(`Failed to create event: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
      } else {
        alert('Failed to create event. Please try again.');
      }
    }
  };

  return (
    <div className="create-event-container">
      <h2 className="create-event-title">Create New Event</h2>
      <form onSubmit={handleSubmit} className="create-event-form">
        <input 
          type="text" 
          placeholder="Event Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          className="form-input"
        />
        
        <input 
          type="date" 
          placeholder="Event Date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
          className="form-input"
        />
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input form-select"
        >
          <option value="">Select Category (Optional)</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <input 
          type="text" 
          placeholder="Prize Pool (e.g., ₹10,000)" 
          value={prize} 
          onChange={(e) => setPrize(e.target.value)} 
          className="form-input"
        />
        
        <textarea 
          placeholder="Event Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          className="form-input form-textarea"
        />
        
        <div className="image-section">
          <label className="image-section-label">
            Event Image {uploading && <span style={{ color: '#f59e0b' }}>(Uploading...)</span>}
          </label>
          
          {/* Tab buttons */}
          <div className="image-tabs">
            <button 
              type="button" 
              onClick={() => setImageInputMode('url')}
              className={`image-tab-button ${imageInputMode === 'url' ? 'active' : ''}`}
            >
              Image URL
            </button>
            <button 
              type="button" 
              onClick={handleFileInputClick}
              className={`image-tab-button ${imageInputMode === 'file' ? 'active' : ''}`}
            >
              Upload File
            </button>
          </div>
          
          {imageInputMode === 'url' ? (
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="url" 
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)" 
                value={image && image.startsWith('http') ? image : ''} 
                onChange={handleUrlChange}
                className="form-input"
              />
              <small className="helper-text">
                Paste a direct link to an image
              </small>
            </div>
          ) : (
            <div onClick={handleFileInputClick}>
              <ImageUploader
                onImageChange={handleImageUpload}
                currentImage={imageInputMode === 'file' ? image : ''}
                placeholder="Upload an event image or poster"
              />
            </div>
          )}
          
          {/* Image Preview */}
          {image && !uploading && (
            <div>
              <p className="success-text">
                ✓ Image {image.startsWith('http') ? 'URL' : 'file'} added successfully
              </p>
              {image && (
                <div className="image-preview">
                  <img 
                    src={image} 
                    alt="Preview" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="error-text" style={{ display: 'none' }}>
                    Invalid image URL
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setImage('')}
                    className="image-remove-button"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={uploading}
          className="submit-button"
        >
          {uploading ? 'Uploading Image...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
