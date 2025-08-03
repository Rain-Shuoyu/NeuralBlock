import React from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { ReactFlowProvider } from 'reactflow';
import './App.css';

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Canvas />
        </div>
      </div>
    </ReactFlowProvider>
  );
}