import React from 'react';

export default function BottomToolbar({ onClear }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '16px',
      backgroundColor: '#f5f5f5',
      padding: '8px',
      borderRadius: '8px',
      zIndex: 10
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
    </div>
  );
}