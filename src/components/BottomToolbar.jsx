import React from 'react';

export default function BottomToolbar({ onClear, onUndo, canUndo, isDarkMode }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '16px',
      backgroundColor: isDarkMode ? '#374151' : '#f5f5f5',
      padding: '8px',
      borderRadius: '8px',
      zIndex: 10,
      boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <button 
        onClick={onClear}
        style={{
          padding: '12px 24px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#cc3333';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ff4444';
        }}
      >
        清空画布
      </button>
      
      <button 
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          padding: '12px 24px',
          backgroundColor: canUndo ? '#4CAF50' : (isDarkMode ? '#4b5563' : '#cccccc'),
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (canUndo) {
            e.target.style.backgroundColor = '#45a049';
          }
        }}
        onMouseLeave={(e) => {
          if (canUndo) {
            e.target.style.backgroundColor = '#4CAF50';
          }
        }}
        title="撤销 (Ctrl+Z)"
      >
        撤销
      </button>
    </div>
  );
}