import React from 'react';

const CustomAlert = ({ message, type = 'success', onClose }) => {
  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    borderRadius: '8px',
    backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  return (
    <div style={containerStyle}>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '0',
          marginLeft: '10px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default CustomAlert;