// --- src/pages/Dashboard.jsx ---
// The main hub for a logged-in user.

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="avatar-display">
          <span role="img" aria-label="waving hand">👋</span>
        </div>
        <div>
          <h1>Welcome, {user?.name}!</h1>
          <p>Ready for a new adventure?</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <Link to="/story-generator" className="card card-start-workout">
          <h2>START WORKOUT</h2>
          <p>AI Fitness Stories</p>
        </Link>
        <Link to="/avatar-editor" className="card card-my-avatar">
          <h3>My Avatar</h3>
        </Link>
        <Link to="/habits" className="card card-my-progress">
          <h3>My Progress</h3>
        </Link>
        <div className="card card-daily-streak">
          <h3>Daily Streak</h3>
          <p>{user?.streak} days in a row! 🔥</p>
        </div>
        <div className="card card-todays-challenge">
          <h3>Today's Challenge</h3>
          <p>Complete a 5-minute workout to earn bonus points!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
