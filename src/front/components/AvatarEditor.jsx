import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAvatar } from '../Contexts/AvatarContext';
import AvatarDisplay from './AvatarDisplay';
import {
  AVATAR_STYLES,
  getStyleOptions,
  generateRandomSeed,
  createAvatarConfig
} from '../utils/avatarUtils';
import '../styles/AvatarEditorPage.css';

const AvatarEditor = () => {
  const navigate = useNavigate();
  const {
    currentAvatar,
    updateCurrentAvatar,
    saveCurrentAvatar,
    userStats
  } = useAvatar();

  // Local state for preview
  const [previewAvatar, setPreviewAvatar] = useState(currentAvatar || {
    style: 'avataaars',
    seed: generateRandomSeed(),
    backgroundColor: 'b6e3f4'
  });

  const [activeTab, setActiveTab] = useState('style');
  const [avatarName, setAvatarName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync preview with current avatar changes
  useEffect(() => {
    if (currentAvatar) {
      setPreviewAvatar(currentAvatar);
    }
  }, [currentAvatar]);

  // Get available options for current style
  const getOptions = (category) => {
    if (!previewAvatar.style) return [];
    const styleOpts = getStyleOptions(previewAvatar.style);
    return styleOpts[category] || [];
  };

  // Handle any avatar property change
  const handleChange = (updates) => {
    setPreviewAvatar(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Change avatar style
  const handleStyleChange = (newStyle) => {
    const newConfig = createAvatarConfig({
      style: newStyle,
      seed: generateRandomSeed()
    });
    setPreviewAvatar(newConfig);
  };

  // Save avatar to collection
  const handleSave = () => {
    if (!avatarName.trim()) {
      alert('Please enter a name for your avatar!');
      return;
    }

    setIsSaving(true);
    try {
      saveCurrentAvatar(avatarName);
      updateCurrentAvatar(previewAvatar);
      setAvatarName('');
      alert(`✅ "${avatarName}" saved successfully!`);
    } catch (error) {
      alert('❌ Error saving avatar. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Set as current avatar without saving
  const handleUse = () => {
    updateCurrentAvatar(previewAvatar);
    alert('✅ Avatar updated!');
  };

  // Generate random avatar
  const handleRandomize = () => {
    const randomConfig = createAvatarConfig({
      style: previewAvatar.style,
      seed: generateRandomSeed()
    });
    setPreviewAvatar(randomConfig);
  };

  // Reset to current avatar
  const handleReset = () => {
    setPreviewAvatar(currentAvatar || {
      style: 'avataaars',
      seed: generateRandomSeed()
    });
    setAvatarName('');
  };

  // Color options
  const hairColors = ['auburn', 'black', 'blonde', 'blondeGolden', 'brown', 'brownDark', 'pastelPink', 'platinum', 'red', 'silverGray'];
  const clothingColors = ['black', 'blue01', 'blue02', 'blue03', 'gray01', 'gray02', 'heather', 'pastelBlue', 'pastelGreen', 'pastelOrange', 'pastelRed', 'pastelYellow', 'pink', 'red', 'white'];
  const skinColors = ['tanned', 'yellow', 'pale', 'light', 'brown', 'darkBrown', 'black'];

  const tabs = [
    { id: 'style', label: 'Avatar Style', icon: '✨' },
    { id: 'features', label: 'Features', icon: '🎭' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
  ];

  return (
    <div className="avatar-editor-page">
      {/* Header */}
      <div className="editor-header">
        <div className="header-content">
          <div className="header-left">
            <div className="cube-icon">🎨</div>
            <div className="header-text">
              <h1>Avatar Art Studio</h1>
              <p>Create and customize your perfect fitness character</p>
            </div>
          </div>
          <div className="header-right">
            <div className="level-display">
              <div className="level-text">Level {userStats?.level || 1}</div>
              <div className="xp-text">⭐ {userStats?.xp || 0} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-content">
        {/* Left Panel - Preview */}
        <div className="preview-section">
          <div className="preview-card">
            <h2>Your Avatar Preview</h2>

            <div className="avatar-display-container">
              <AvatarDisplay
                config={previewAvatar}
                size="huge"
                showLevel={true}
                level={userStats?.level || 1}
                showBorder={true}
              />
            </div>

            {previewAvatar.style && (
              <div className="current-style-info">
                <h4>Current Style</h4>
                <p>{previewAvatar.style}</p>
                <span className="kid-friendly-badge">Kid-Friendly ✓</span>
              </div>
            )}

            {/* Save Controls */}
            <div className="save-controls">
              <input
                type="text"
                className="avatar-name-input"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                placeholder="Enter avatar name..."
                maxLength={30}
              />

              <div className="control-buttons">
                <button
                  className="control-button save-button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  💾 Save Avatar
                </button>

                <button
                  className="control-button use-button"
                  onClick={handleUse}
                >
                  ✅ Use This Avatar
                </button>

                <button
                  className="control-button randomize-button"
                  onClick={handleRandomize}
                >
                  🎲 Randomize
                </button>

                <button
                  className="control-button reset-button"
                  onClick={handleReset}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Customization */}
        <div className="customization-section">
          <div className="customization-card">
            <h2>Customize Your Avatar</h2>

            {/* Tabs */}
            <div className="editor-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`editor-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Style Tab */}
              {activeTab === 'style' && (
                <div className="tab-panel">
                  <h3>Choose Avatar Style</h3>
                  <p>Select a style for your avatar character</p>

                  <div className="item-selector">
                    <h4 className="selector-title">Available Styles</h4>
                    <p className="options-count">{Object.keys(AVATAR_STYLES).length} styles available</p>

                    <div className="option-buttons-grid">
                      {Object.entries(AVATAR_STYLES).map(([key, value]) => (
                        <button
                          key={value}
                          className={`option-button ${previewAvatar.style === value ? 'selected' : ''}`}
                          onClick={() => handleStyleChange(value)}
                        >
                          <span className="option-label">{key}</span>
                        </button>
                      ))}
                    </div>

                    <div className="current-selection">
                      <span className="selection-label">Current:</span>
                      <span className="selection-value">{previewAvatar.style}</span>
                    </div>
                  </div>

                  {/* Seed Customization */}
                  <div className="item-selector">
                    <h4 className="selector-title">Avatar Variation (Seed)</h4>
                    <p className="options-count">Change the seed to get different variations</p>

                    <input
                      type="text"
                      className="avatar-name-input"
                      value={previewAvatar.seed || ''}
                      onChange={(e) => handleChange({ seed: e.target.value })}
                      placeholder="Enter custom seed..."
                      style={{ marginBottom: '1rem' }}
                    />

                    <button
                      className="option-button"
                      onClick={() => handleChange({ seed: generateRandomSeed() })}
                    >
                      🎲 Generate Random Seed
                    </button>
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div className="tab-panel">
                  <h3>Customize Features</h3>
                  <p>Style-specific customization options</p>

                  {previewAvatar.style === 'avataaars' && (
                    <>
                      {/* Hairstyle */}
                      {getOptions('top').length > 0 && (
                        <div className="item-selector">
                          <h4 className="selector-title">💇 Hairstyle</h4>
                          <p className="options-count">{getOptions('top').length} options</p>

                          <div className="option-buttons-grid">
                            {getOptions('top').map(opt => (
                              <button
                                key={opt}
                                className={`option-button ${previewAvatar.top === opt ? 'selected' : ''}`}
                                onClick={() => handleChange({ top: opt })}
                              >
                                <span className="option-label">
                                  {opt.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </button>
                            ))}
                          </div>

                          {previewAvatar.top && (
                            <div className="current-selection">
                              <span className="selection-label">Current:</span>
                              <span className="selection-value">
                                {previewAvatar.top.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clothing */}
                      {getOptions('clothing').length > 0 && (
                        <div className="item-selector">
                          <h4 className="selector-title">👕 Clothing</h4>
                          <p className="options-count">{getOptions('clothing').length} options</p>

                          <div className="option-buttons-grid">
                            {getOptions('clothing').map(opt => (
                              <button
                                key={opt}
                                className={`option-button ${previewAvatar.clothing === opt ? 'selected' : ''}`}
                                onClick={() => handleChange({ clothing: opt })}
                              >
                                <span className="option-label">
                                  {opt.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </button>
                            ))}
                          </div>

                          {previewAvatar.clothing && (
                            <div className="current-selection">
                              <span className="selection-label">Current:</span>
                              <span className="selection-value">
                                {previewAvatar.clothing.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Accessories */}
                      {getOptions('accessories').length > 0 && (
                        <div className="item-selector">
                          <h4 className="selector-title">👓 Accessories</h4>
                          <p className="options-count">{getOptions('accessories').length + 1} options</p>

                          <div className="option-buttons-grid">
                            <button
                              className={`option-button ${(!previewAvatar.accessories || previewAvatar.accessories.length === 0) ? 'selected' : ''}`}
                              onClick={() => handleChange({ accessories: [] })}
                            >
                              <span className="option-label">None</span>
                            </button>
                            {getOptions('accessories').map(opt => (
                              <button
                                key={opt}
                                className={`option-button ${previewAvatar.accessories?.[0] === opt ? 'selected' : ''}`}
                                onClick={() => handleChange({ accessories: [opt] })}
                              >
                                <span className="option-label">
                                  {opt.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="current-selection">
                            <span className="selection-label">Current:</span>
                            <span className="selection-value">
                              {previewAvatar.accessories?.[0]?.replace(/([A-Z])/g, ' $1').trim() || 'None'}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {previewAvatar.style === 'bottts' && (
                    <>
                      {/* Eyes */}
                      {getOptions('eyes').length > 0 && (
                        <div className="item-selector">
                          <h4 className="selector-title">👀 Eyes</h4>
                          <p className="options-count">{getOptions('eyes').length} options</p>

                          <div className="option-buttons-grid">
                            {getOptions('eyes').map(opt => (
                              <button
                                key={opt}
                                className={`option-button ${previewAvatar.eyes === opt ? 'selected' : ''}`}
                                onClick={() => handleChange({ eyes: opt })}
                              >
                                <span className="option-label">
                                  {opt.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mouth */}
                      {getOptions('mouth').length > 0 && (
                        <div className="item-selector">
                          <h4 className="selector-title">😊 Mouth</h4>
                          <p className="options-count">{getOptions('mouth').length} options</p>

                          <div className="option-buttons-grid">
                            {getOptions('mouth').map(opt => (
                              <button
                                key={opt}
                                className={`option-button ${previewAvatar.mouth === opt ? 'selected' : ''}`}
                                onClick={() => handleChange({ mouth: opt })}
                              >
                                <span className="option-label">
                                  {opt.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {previewAvatar.style !== 'avataaars' && previewAvatar.style !== 'bottts' && (
                    <div className="no-options-message">
                      <p>This avatar style uses the seed for variations.</p>
                      <p>Try the randomize button or enter a custom seed!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === 'colors' && previewAvatar.style === 'avataaars' && (
                <div className="tab-panel">
                  <h3>Customize Colors</h3>
                  <p>Choose colors for hair, clothing, and skin</p>

                  {/* Hair Color */}
                  <div className="item-selector">
                    <h4 className="selector-title">💇 Hair Color</h4>
                    <p className="options-count">{hairColors.length} colors available</p>

                    <div className="option-buttons-grid">
                      {hairColors.map(color => (
                        <button
                          key={color}
                          className={`option-button ${previewAvatar.hairColor?.[0] === color ? 'selected' : ''}`}
                          onClick={() => handleChange({ hairColor: [color] })}
                        >
                          <span className="option-label">
                            {color.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="current-selection">
                      <span className="selection-label">Current:</span>
                      <span className="selection-value">
                        {previewAvatar.hairColor?.[0]?.replace(/([A-Z])/g, ' $1').trim() || 'Default'}
                      </span>
                    </div>
                  </div>

                  {/* Clothing Color */}
                  <div className="item-selector">
                    <h4 className="selector-title">👕 Clothing Color</h4>
                    <p className="options-count">{clothingColors.length} colors available</p>

                    <div className="option-buttons-grid">
                      {clothingColors.map(color => (
                        <button
                          key={color}
                          className={`option-button ${previewAvatar.clothingColor?.[0] === color ? 'selected' : ''}`}
                          onClick={() => handleChange({ clothingColor: [color] })}
                        >
                          <span className="option-label">
                            {color.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="current-selection">
                      <span className="selection-label">Current:</span>
                      <span className="selection-value">
                        {previewAvatar.clothingColor?.[0]?.replace(/([A-Z])/g, ' $1').trim() || 'Default'}
                      </span>
                    </div>
                  </div>

                  {/* Skin Color */}
                  <div className="item-selector">
                    <h4 className="selector-title">🎨 Skin Tone</h4>
                    <p className="options-count">{skinColors.length} tones available</p>

                    <div className="option-buttons-grid">
                      {skinColors.map(color => (
                        <button
                          key={color}
                          className={`option-button ${previewAvatar.skin?.[0] === color ? 'selected' : ''}`}
                          onClick={() => handleChange({ skin: [color] })}
                        >
                          <span className="option-label">
                            {color.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="current-selection">
                      <span className="selection-label">Current:</span>
                      <span className="selection-value">
                        {previewAvatar.skin?.[0]?.replace(/([A-Z])/g, ' $1').trim() || 'Default'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'colors' && previewAvatar.style !== 'avataaars' && (
                <div className="tab-panel">
                  <div className="no-options-message">
                    <p>Color customization is available for the Avataaars style.</p>
                    <p>Switch to Avataaars in the Style tab to customize colors!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation */}
      <div className="editor-navigation">
        <div className="nav-buttons">
          <button
            className="nav-btn secondary"
            onClick={() => navigate('/dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className="nav-btn tertiary"
            onClick={() => navigate('/avatar-manager')}
          >
            👥 Collection
          </button>
          <button
            className="nav-btn primary"
            onClick={() => navigate('/home')}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;