import React from 'react';
import { AVATAR_STYLES, createDefaultAvatarConfig } from '../utils/avatarUtils';
import '../styles/AvatarEditorPage.css';

const StyleSelector = ({ currentStyle, currentConfig, onChange }) => {
  const styles = Object.keys(AVATAR_STYLES);

  console.log('StyleSelector - Current:', {
    currentStyle,
    currentConfig,
    availableStyles: styles
  });

  const handleStyleChange = (newStyle) => {
    if (newStyle === currentStyle) {
      console.log('✨ Style already selected:', newStyle);
      return;
    }

    console.log('✨ Changing style from', currentStyle, 'to', newStyle);

    // Log the new style options for debugging
    const styleConfig = AVATAR_STYLES[newStyle];
    if (styleConfig) {
      console.group(`🎨 Debug: ${styleConfig.name} Options`);
      // 🔧 FIX: Changed from customOptions to availableOptions
      Object.entries(styleConfig.availableOptions || {}).forEach(([category, options]) => {
        console.log(`${category}:`, options);
      });
      console.groupEnd();
    }

    if (onChange) {
      // CRITICAL FIX: Just pass the style string, not entire config
      // Let the parent component handle creating the full config
      console.log('✅ Calling onChange with style:', newStyle);
      onChange(newStyle);
    }
  };

  // Helper to format style names nicely
  const formatStyleName = (styleKey) => {
    const style = AVATAR_STYLES[styleKey];
    return style ? style.name : styleKey.charAt(0).toUpperCase() + styleKey.slice(1);
  };

  return (
    <div className="item-selector">
      <div className="selector-section">
        <h4 className="selector-title">Avatar Style</h4>
        <div className="options-count">{styles.length} styles available</div>

        {/* COMPACT BUTTON GRID */}
        <div className="option-buttons-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          {styles.map(styleKey => {
            const style = AVATAR_STYLES[styleKey];
            const isSelected = currentStyle === styleKey;

            return (
              <button
                key={styleKey}
                className={`option-button ${isSelected ? 'selected' : ''}`}
                onClick={() => handleStyleChange(styleKey)}
                title={style.description}
                style={{
                  padding: '1rem',
                  border: isSelected ? '3px solid #8B5CF6' : '2px solid #E5E7EB',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative'
                }}
              >
                <span className="option-label" style={{
                  fontWeight: isSelected ? '700' : '600',
                  fontSize: '1rem',
                  color: isSelected ? '#8B5CF6' : '#2D3748',
                  textAlign: 'center'
                }}>
                  {formatStyleName(styleKey)}
                </span>

                {/* Kid-friendly badge */}
                {style.kidFriendly && (
                  <span className="kid-badge" style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    fontSize: '1.2rem'
                  }}>
                    👶
                  </span>
                )}

                {/* Selected checkmark */}
                {isSelected && (
                  <span style={{
                    fontSize: '1.5rem',
                    color: '#8B5CF6'
                  }}>
                    ✓
                  </span>
                )}

                {/* Description on hover */}
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {style.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Show current selection */}
        {currentStyle && AVATAR_STYLES[currentStyle] && (
          <div className="current-selection" style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(139, 92, 246, 0.05)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span className="selection-label" style={{
              fontWeight: '600',
              color: '#6B7280'
            }}>
              Current Style:
            </span>
            <span className="selection-value" style={{
              fontWeight: '700',
              color: '#8B5CF6',
              fontSize: '1.1rem'
            }}>
              {formatStyleName(currentStyle)}
            </span>
          </div>
        )}

        {/* Show available customizations for current style */}
        {currentStyle && AVATAR_STYLES[currentStyle] && (
          <div className="style-info" style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(236, 72, 153, 0.05)',
            borderRadius: '10px'
          }}>
            <h5 style={{
              margin: '0 0 0.75rem 0',
              color: '#2D3748',
              fontSize: '1rem',
              fontWeight: '700'
            }}>
              ✨ Available Customizations:
            </h5>
            <div className="customization-preview" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {/* 🔧 FIX: Changed from customOptions to availableOptions */}
              {Object.keys(AVATAR_STYLES[currentStyle].availableOptions || {}).map(category => (
                <span key={category} className="category-tag" style={{
                  padding: '0.4rem 0.8rem',
                  background: 'white',
                  border: '2px solid #EC4899',
                  color: '#EC4899',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleSelector;