// src/admin/CreateEvent.js
import React, { useState } from 'react';
import axios from 'axios';
import ImageUploader from './ImageUploader';

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
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '15px' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Create New Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Event Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        
        <input 
          type="date" 
          placeholder="Event Date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
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
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        
        <textarea 
          placeholder="Event Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          rows="3"
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical', fontSize: '14px', lineHeight: '1.4' }}
        />
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
            Event Image {uploading && <span style={{ color: 'orange' }}>(Uploading...)</span>}
          </label>
          
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button 
              type="button" 
              onClick={() => setImageInputMode('url')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: imageInputMode === 'url' ? '2px solid #667eea' : '2px solid #e2e8f0',
                background: imageInputMode === 'url' ? '#667eea' : '#f8f9fa',
                color: imageInputMode === 'url' ? 'white' : '#4a5568',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              🔗 Image URL
            </button>
            <button 
              type="button" 
              onClick={handleFileInputClick}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: imageInputMode === 'file' ? '2px solid #667eea' : '2px solid #e2e8f0',
                background: imageInputMode === 'file' ? '#667eea' : '#f8f9fa',
                color: imageInputMode === 'file' ? 'white' : '#4a5568',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              📁 Upload File
            </button>
          </div>
          
          {imageInputMode === 'url' ? (
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="url" 
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)" 
                value={image && image.startsWith('http') ? image : ''} 
                onChange={handleUrlChange}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '2px solid #e2e8f0', 
                  fontSize: '14px',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#fafafa'
                }}
              />
              <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
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
              <p style={{ color: 'green', fontSize: '12px', marginTop: '8px' }}>
                ✅ Image {image.startsWith('http') ? 'URL' : 'file'} added successfully
              </p>
              {image && (
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <img 
                    src={image} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none', color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    ❌ Invalid image URL
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setImage('')}
                    style={{
                      display: 'block',
                      margin: '8px auto 0',
                      padding: '4px 8px',
                      background: '#ff4757',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={uploading}
          style={{ 
            padding: '10px 16px', 
            backgroundColor: uploading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '14px',
            fontWeight: '500',
            cursor: uploading ? 'not-allowed' : 'pointer',
            marginTop: '8px'
          }}
        >
          {uploading ? 'Uploading Image...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
