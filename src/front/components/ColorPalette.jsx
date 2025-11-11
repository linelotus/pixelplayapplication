import React, { useState } from 'react';

const ColorPalette = ({ avatar, availableColors = [], onChange }) => {
  const [activeColorType, setActiveColorType] = useState('hair');

  // Expanded color map with more options
  const colorMap = {
    // Basic colors
    blue: '#2196F3',
    red: '#F44336',
    green: '#4CAF50',
    purple: '#9C27B0',
    orange: '#FF9800',
    yellow: '#FFEB3B',
    pink: '#E91E63',
    brown: '#795548',
    black: '#424242',
    white: '#FAFAFA',
    gray: '#9E9E9E',
    
    // Hair colors
    blonde: '#F5DEB3',
    auburn: '#A52A2A',
    platinum: '#E5E4E2',
    
    // Skin tones
    light: '#F5DEB3',
    medium: '#D2B48C',
    dark: '#8B4513',
    pale: '#F8E6CC',
    tanned: '#D2B48C',
    
    // Hex colors (for advanced users)
    '2196F3': '#2196F3',
    'F44336': '#F44336',
    '4CAF50': '#4CAF50',
    '9C27B0': '#9C27B0',
    'FF9800': '#FF9800',
    'FFEB3B': '#FFEB3B',
    'E91E63': '#E91E63',
    '795548': '#795548',
  };

  // Get the actual color hex value
  const getColorHex = (color) => {
    if (!color) return '#CCCCCC';
    if (color.startsWith('#')) return color;
    return colorMap[color] || colorMap[color.toLowerCase()] || `#${color}` || '#CCCCCC';
  };

  // Format color name nicely
  const formatColorName = (color) => {
    return String(color)
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Handle color selection
  const handleColorClick = (colorType, color) => {
    console.log(`🎨 Color selected - ${colorType}:`, color);
    
    // Create the update object based on color type
    let update = {};
    
    switch(colorType) {
      case 'hair':
        update = { hairColor: color };
        break;
      case 'clothing':
        update = { clothingColor: color };
        break;
      case 'skin':
        update = { skinColor: color };
        break;
      case 'accessory':
        update = { accessoryColor: color };
        break;
      default:
        update = { [colorType]: color };
    }
    
    console.log('✅ Calling onChange with:', update);
    
    if (onChange) {
      onChange(update);
    }
  };

  // Get current color value for a type
  const getCurrentColor = (colorType) => {
    switch(colorType) {
      case 'hair':
        return avatar.hairColor || avatar.hair?.color;
      case 'clothing':
        return avatar.clothingColor || avatar.clothing?.color;
      case 'skin':
        return avatar.skinColor || avatar.skin;
      case 'accessory':
        return avatar.accessoryColor;
      default:
        return null;
    }
  };

  // Color categories
  const colorCategories = [
    { id: 'hair', label: '💇 Hair Color', icon: '💇' },
    { id: 'clothing', label: '👕 Clothing Color', icon: '👕' },
    { id: 'skin', label: '🎨 Skin Tone', icon: '🎨' },
    { id: 'accessory', label: '👓 Accessory Color', icon: '👓' }
  ];

  // Default colors if none provided
  const defaultColors = [
    'blue', 'red', 'green', 'purple', 'orange', 
    'yellow', 'pink', 'brown', 'black', 'white', 'gray'
  ];

  const colorsToShow = availableColors.length > 0 ? availableColors : defaultColors;

  return (
    <div className="color-palette" style={{
      padding: '1rem'
    }}>
      <h4 style={{ 
        marginBottom: '1.5rem', 
        color: '#2D3748',
        fontSize: '1.3rem',
        fontWeight: '700'
      }}>
        🎨 Choose Colors
      </h4>
      
      {/* Color Type Selector */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {colorCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveColorType(category.id)}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '10px',
              background: activeColorType === category.id
                ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                : '#F3F4F6',
              color: activeColorType === category.id ? 'white' : '#6B7280',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{category.icon}</span>
            <span>{category.label.replace(category.icon, '').trim()}</span>
          </button>
        ))}
      </div>

      {/* Current Selection Display */}
      {getCurrentColor(activeColorType) && (
        <div style={{
          padding: '1rem',
          background: 'rgba(139, 92, 246, 0.05)',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontWeight: '600', color: '#6B7280' }}>
            Current Color:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: getColorHex(getCurrentColor(activeColorType)),
              border: '2px solid rgba(0,0,0,0.1)'
            }} />
            <span style={{ fontWeight: '700', color: '#8B5CF6' }}>
              {formatColorName(getCurrentColor(activeColorType))}
            </span>
          </div>
        </div>
      )}
      
      {/* Color Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '1rem'
      }}>
        {colorsToShow.map(color => {
          const currentColor = getCurrentColor(activeColorType);
          const isSelected = currentColor === color;
          const colorHex = getColorHex(color);
          
          return (
            <button
              key={color}
              onClick={() => handleColorClick(activeColorType, color)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'white',
                border: isSelected ? '3px solid #8B5CF6' : '2px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
              }}
              title={formatColorName(color)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                background: colorHex,
                borderRadius: '10px',
                border: '2px solid rgba(0,0,0,0.1)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }} />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? '#8B5CF6' : '#6B7280',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {formatColorName(color)}
              </span>
              {isSelected && (
                <span style={{ fontSize: '1.2rem', color: '#8B5CF6' }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '10px',
        fontSize: '0.85rem',
        color: '#6B7280',
        textAlign: 'center'
      }}>
        💡 <strong>Tip:</strong> Click the tabs above to change different color types, 
        then select a color from the palette!
      </div>
    </div>
  );
};

export default ColorPalette;