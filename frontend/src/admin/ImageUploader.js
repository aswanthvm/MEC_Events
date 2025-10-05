// Alternative Solution 2: Base64 Image Component
import React, { useState } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ onImageChange, currentImage, placeholder = "No image selected" }) => {
  const [preview, setPreview] = useState(currentImage || '');
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'url'
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (file) => {
    // Detailed file validation
    if (!file) {
      alert('No file selected');
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, GIF, WebP)');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert(`File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please select an image smaller than 5MB.`);
      return;
    }

    // Check for common image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Unsupported image format. Please use JPG, PNG, GIF, or WebP format.');
      return;
    }

    // File is valid, proceed with reading
    const reader = new FileReader();
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreview(base64String);
      onImageChange(base64String);
    };
    
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setPreview('');
    setImageUrl('');
    onImageChange('');
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    
    if (url) {
      setPreview(url);
      onImageChange(url);
    } else {
      setPreview('');
      onImageChange('');
    }
  };

  const switchToFileMode = () => {
    setInputMode('file');
    setImageUrl('');
    if (!preview || preview.startsWith('data:')) {
      // Keep file preview if it exists
    } else {
      // Clear URL preview
      setPreview('');
      onImageChange('');
    }
  };

  const switchToUrlMode = () => {
    setInputMode('url');
    if (preview && !preview.startsWith('data:')) {
      setImageUrl(preview);
    }
  };

  return (
    <div className="image-uploader">
      {/* Tab buttons */}
      <div className="upload-tabs">
        <button 
          type="button" 
          className={`tab-btn ${inputMode === 'file' ? 'active' : ''}`}
          onClick={switchToFileMode}
        >
          📁 Upload File
        </button>
        <button 
          type="button" 
          className={`tab-btn ${inputMode === 'url' ? 'active' : ''}`}
          onClick={switchToUrlMode}
        >
          🔗 Image URL
        </button>
      </div>

      {inputMode === 'file' ? (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview && preview.startsWith('data:') ? (
            <div className="image-preview-container">
              <img src={preview} alt="Preview" className="uploaded-image-preview" />
              <button type="button" onClick={removeImage} className="remove-image-btn">
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📷</div>
              <p>Drag & drop an image here, or click to select</p>
              <p className="upload-info">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="file-input-hidden"
          />
        </div>
      ) : (
        <div className="url-input-section">
          <input
            type="url"
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
            value={imageUrl}
            onChange={handleUrlChange}
            className="url-input"
          />
          <p className="url-info">Paste a direct link to an image</p>
          
          {preview && !preview.startsWith('data:') && (
            <div className="image-preview-container">
              <img 
                src={preview} 
                alt="Preview" 
                className="uploaded-image-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="preview-error" style={{ display: 'none' }}>
                <span>❌ Invalid image URL</span>
              </div>
              <button type="button" onClick={removeImage} className="remove-image-btn">
                ✕ Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;