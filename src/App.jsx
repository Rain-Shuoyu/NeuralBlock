import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { ReactFlowProvider } from 'reactflow';
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ReactFlowProvider>
      <div className={`app-container ${isDarkMode ? 'dark' : ''}`} style={{
        backgroundColor: isDarkMode ? '#111827' : '#ffffff'
      }}>
        <Sidebar isDarkMode={isDarkMode} />
        <div className="main-content">
          <Canvas isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}