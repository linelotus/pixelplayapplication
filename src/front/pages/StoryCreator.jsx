import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StoryCreator.css';

const StoryCreator = () => {
  const navigate = useNavigate();

  return (
    <div className="story-creator-container">
      {/* Navigation */}
      <nav className="story-nav">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </nav>

      {/* Coming Soon Content */}
      <div className="coming-soon-content">
        <div className="animation-container">
          <div className="icon-large">🏋️</div>
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">✨</div>
          <div className="sparkle sparkle-3">✨</div>
        </div>

        <h1 className="coming-soon-title">Story Workout Creator</h1>
        <h2 className="coming-soon-subtitle">Coming Soon!</h2>
        
        <p className="coming-soon-description">
          We're creating something amazing! Soon you'll be able to create your own stories 
          turning them into exciting workout adventures. Imagine doing squats while 
          climbing a mountain or running in place while escaping a dragon!
        </p>

        <div className="features-preview">  
          {/* Future feature previews go here */}
        </div>

        <div className="action-buttons">
          <button 
            className="primary-button"
            onClick={() => navigate('/games')}
          >
            🎮 Play & Exercise Other Games
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/dashboard')}
          >
            View Dashboard
          </button>
        </div>

        <div className="notify-section">
          <p className="notify-text">Want to know when it's ready?</p>
          <p className="notify-subtext">Check back soon for updates!</p>
        </div>
      </div>
    </div>
  );
};

export default StoryCreator;
