import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AvatarProvider } from './Context/AvatarContext';
import AvatarEditorPage from './pages/AvatarEditorPage';
import Dashboard from './pages/Dashboard';
import '../styles/Avatar.css';

function App() {
  return (
    <div className="App">
      {/* 🎫 STEP 1: Give everyone the membership wristband */}
      <AvatarProvider>
        
        {/* 🛣️ STEP 2: Set up the park map for navigation */}
        <Router>
          <Routes>
            {/* 🏠 Home entrance - Shows the Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* 🎨 Avatar customization booth */}
            <Route path="/avatar-editor" element={<AvatarEditorPage />} />
            
            {/* Add more rides (pages) here! */}
          </Routes>
        </Router>
        
      </AvatarProvider>
    </div>
  );
}

export default App;