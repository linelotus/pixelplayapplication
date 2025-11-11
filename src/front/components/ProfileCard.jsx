import React from 'react';
import AvatarDisplay from './AvatarDisplay';
import { getCurrentAvatarFromStorage } from '../utils/avatarUtils';
//import '../styles/ProfileCard.css';

/**
 * ProfileCard Component
 * 
 * Reusable profile card that displays user avatar and info
 * Can be used in: Navbar, Dashboard, Home page, Profile page
 */

const ProfileCard = ({ 
  variant = 'default', // 'default', 'compact', 'navbar', 'card'
  showStats = true,
  showAvatar = true,
  showLevel = true,
  showActions = false,
  onEditAvatar,
  onViewProfile,
  className = ''
}) => {
  // Get user data from localStorage
  const getUserData = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  };

  const user = getUserData();
  const currentAvatar = getCurrentAvatarFromStorage();

  // Default user data if not logged in (for demo purposes)
  const displayUser = user || {
    name: 'Player',
    email: 'player@pixelplay.com',
    level: 1,
    xp: 0,
    coins: 100
  };

  // Calculate XP progress
  const xpForNextLevel = displayUser.level * 100;
  const xpProgress = (displayUser.xp / xpForNextLevel) * 100;

  // Render based on variant
  if (variant === 'navbar') {
    return (
      <div className={`profile-card navbar-variant ${className}`} onClick={onViewProfile}>
        {showAvatar && (
          <AvatarDisplay 
            config={currentAvatar}
            size="small"
            showLevel={false}
            showBorder={true}
          />
        )}
        <div className="profile-info-compact">
          <div className="profile-name">{displayUser.name}</div>
          {showLevel && (
            <div className="profile-level">Lv. {displayUser.level}</div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`profile-card compact-variant ${className}`} onClick={onViewProfile}>
        {showAvatar && (
          <AvatarDisplay 
            config={currentAvatar}
            size="medium"
            showLevel={showLevel}
            level={displayUser.level}
          />
        )}
        <div className="profile-info">
          <h3 className="profile-name">{displayUser.name}</h3>
          {showStats && (
            <div className="profile-stats-compact">
              <span className="stat">⭐ {displayUser.xp} XP</span>
              <span className="stat">💰 {displayUser.coins}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`profile-card card-variant ${className}`}>
        <div className="profile-header">
          {showAvatar && (
            <AvatarDisplay 
              config={currentAvatar}
              size="large"
              showLevel={showLevel}
              level={displayUser.level}
            />
          )}
        </div>
        
        <div className="profile-body">
          <h2 className="profile-name">{displayUser.name}</h2>
          <p className="profile-email">{displayUser.email}</p>
          
          {showStats && (
            <>
              <div className="profile-level-info">
                <div className="level-header">
                  <span>Level {displayUser.level}</span>
                  <span>{displayUser.xp} / {xpForNextLevel} XP</span>
                </div>
                <div className="level-progress-bar">
                  <div 
                    className="level-progress-fill"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              <div className="profile-stats-grid">
                <div className="stat-box">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{displayUser.xp}</div>
                  <div className="stat-label">Experience</div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{displayUser.coins}</div>
                  <div className="stat-label">Coins</div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">{displayUser.level}</div>
                  <div className="stat-label">Level</div>
                </div>
              </div>
            </>
          )}

          {showActions && (
            <div className="profile-actions">
              <button 
                className="profile-btn primary"
                onClick={onEditAvatar}
              >
                🎨 Edit Avatar
              </button>
              <button 
                className="profile-btn secondary"
                onClick={onViewProfile}
              >
                👤 View Profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`profile-card default-variant ${className}`}>
      {showAvatar && (
        <AvatarDisplay 
          config={currentAvatar}
          size="large"
          showLevel={showLevel}
          level={displayUser.level}
        />
      )}
      <div className="profile-info">
        <h3 className="profile-name">{displayUser.name}</h3>
        <p className="profile-email">{displayUser.email}</p>
        
        {showStats && (
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Level</span>
              <span className="stat-value">{displayUser.level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">XP</span>
              <span className="stat-value">{displayUser.xp}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Coins</span>
              <span className="stat-value">{displayUser.coins}</span>
            </div>
          </div>
        )}

        {showActions && (
          <div className="profile-actions">
            <button className="profile-btn" onClick={onEditAvatar}>
              🎨 Edit Avatar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;