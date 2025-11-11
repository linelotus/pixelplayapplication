import React, { useState } from 'react';
import { useAvatar } from '../Contexts/AvatarContext';
import AvatarDisplay from './AvatarDisplay';
import '../styles/AvatarManager.css';

/**
 * AvatarManager Component
 * 
 * Unified component for managing avatars
 * Combines functionality of AvatarInventory and AvatarGallery
 */

const AvatarManager = ({ onEditAvatar, onClose }) => {
  const {
    savedAvatars,
    currentAvatar,
    loadSavedAvatar,
    deleteSavedAvatar,
    isLoading
  } = useAvatar();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Handle avatar selection
  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
  };

  // Handle using an avatar
  const handleUseAvatar = (avatar) => {
    loadSavedAvatar(avatar.id);
    alert(`✅ Now using: ${avatar.name}`);
    if (onClose) onClose();
  };

  // Handle editing an avatar
  const handleEditAvatar = (avatar) => {
    if (onEditAvatar) {
      onEditAvatar(avatar);
    }
  };

  // Handle deleting an avatar
  const handleDeleteAvatar = (avatar) => {
    if (window.confirm(`Delete "${avatar.name}"? This cannot be undone.`)) {
      deleteSavedAvatar(avatar.id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="avatar-manager loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading your avatars...</p>
      </div>
    );
  }

  // Empty state
  if (!savedAvatars || savedAvatars.length === 0) {
    return (
      <div className="avatar-manager empty">
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <h3>No Saved Avatars Yet</h3>
          <p>Create and save your first avatar to see it here!</p>
          <button
            className="create-btn"
            onClick={() => onEditAvatar && onEditAvatar(null)}
          >
            ✨ Create Your First Avatar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-manager">
      {/* Header */}
      <div className="manager-header">
        <div className="header-left">
          <h2>🎨 Your Avatars</h2>
          <span className="avatar-count">{savedAvatars.length} saved</span>
        </div>

        <div className="header-right">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              📱
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              📋
            </button>
          </div>

          {/* Create New Button */}
          <button
            className="create-new-btn"
            onClick={() => onEditAvatar && onEditAvatar(null)}
          >
            ✨ Create New
          </button>
        </div>
      </div>

      {/* Avatar Grid/List */}
      <div className={`avatars-container ${viewMode}`}>
        {savedAvatars.map((avatar) => {
          const isCurrentAvatar = currentAvatar &&
            JSON.stringify(currentAvatar) === JSON.stringify(avatar.config);

          return (
            <div
              key={avatar.id}
              className={`avatar-item ${isCurrentAvatar ? 'current' : ''} ${selectedAvatar?.id === avatar.id ? 'selected' : ''}`}
              onClick={() => handleSelectAvatar(avatar)}
            >
              {/* Current Avatar Badge */}
              {isCurrentAvatar && (
                <div className="current-badge">✓ Current</div>
              )}

              {/* Avatar Display */}
              <div className="avatar-preview">
                <AvatarDisplay
                  config={avatar.config}
                  size={viewMode === 'grid' ? 'large' : 'medium'}
                  showLevel={false}
                  showBorder={true}
                />
              </div>

              {/* Avatar Info */}
              <div className="avatar-info">
                <h4 className="avatar-name">{avatar.name}</h4>
                <p className="avatar-date">
                  {new Date(avatar.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                {avatar.config?.style && (
                  <span className="avatar-style-tag">
                    {avatar.config.style}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="avatar-actions">
                <button
                  className="action-btn use-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseAvatar(avatar);
                  }}
                  disabled={isCurrentAvatar}
                >
                  {isCurrentAvatar ? '✓ In Use' : '👆 Use'}
                </button>
                <button
                  className="action-btn edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAvatar(avatar);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAvatar(avatar);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Avatar Details (Optional) */}
      {selectedAvatar && (
        <div className="selected-details">
          <h3>Selected: {selectedAvatar.name}</h3>
          <p>Created: {new Date(selectedAvatar.createdAt).toLocaleDateString()}</p>
          {selectedAvatar.config?.seed && (
            <p className="seed-info">Seed: {selectedAvatar.config.seed}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarManager;