// --- src/pages/HomePage.jsx ---
// The landing page for new or logged-out users.

import React, { useState } from 'react';
import Logo from '../components/Logo';
import AuthForm from '../components/AuthForm';

export default function HomePage() {
  const [activeForm, setActiveForm] = useState(null);

  return (
    <div className="homepage-container">
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>
      <div className="shape shape-4"></div>

      <div className={`welcome-content ${activeForm ? 'scaled-down' : ''}`}>
        <div className="logo-container">
          <Logo />
        </div>
        <h1 className="main-title">Pixel Play AI</h1>
        <p className="subtitle">Your adventure in learning, creativity, and fun starts now!</p>
        <div className="button-group">
          <button onClick={() => setActiveForm('signIn')} className="btn btn-primary">Sign In</button>
          <button onClick={() => setActiveForm('signUp')} className="btn btn-secondary">Sign Up</button>
        </div>
      </div>

      {activeForm && (
        <AuthForm type={activeForm} onClose={() => setActiveForm(null)} />
      )}
    </div>
  );
};
