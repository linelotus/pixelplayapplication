// Avatar Customizer Component
// Lets users change colors, themes, and expressions of their avatar

import React, { useState } from 'react';
import AvatarDisplay from './AvatarDisplay.js';
import DiceBearService from '../services/DiceBearService.js';

const AvatarCustomizer = ({ user, onSave }) => {
    // Current customization settings
    const [customization, setCustomization] = useState({
        style: user?.avatarData?.style || 'pixel-art',
        backgroundColor: user?.avatarData?.backgroundColor || 'blue',
        theme: user?.avatarData?.theme || 'superhero',
        mood: user?.avatarData?.mood || 'happy'
    });

    // The seed (unique identifier) for preview
    const [previewSeed] = useState(user?.avatarData?.seed || user?.username || 'preview');

    // Available options
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'yellow', 'black'];
    const themes = Object.keys(DiceBearService.THEMES);
    const moods = ['happy', 'sad', 'surprised', 'angry', 'neutral'];

    // When user clicks save
    const handleSave = () => {
        if (onSave) {
            onSave(customization);
        }
    };

    return (
        <div className="p-4">
            <h4 className="pixel-font mb-4">🎨 Customize Avatar</h4>

            <div className="row">
                <div className="col-md-6">
                    {/* Preview of current customization */}
                    <div className="text-center mb-4">
                        <h5>Preview</h5>
                        <AvatarDisplay
                            user={{
                                username: user?.username || 'preview',
                                level: user?.level || 1,
                                avatarData: {
                                    ...customization,
                                    seed: previewSeed
                                }
                            }}
                            size={150}
                            showLevel={true}
                            className="mb-3"
                        />
                    </div>
                </div>

                <div className="col-md-6">
                    {/* Color picker */}
                    <div className="mb-3">
                        <label className="form-label pixel-font" style={{ fontSize: '10px' }}>
                            Background Color
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    className={`btn btn-sm ${customization.backgroundColor === color ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    style={{
                                        backgroundColor: color === 'black' ? '#000' : color,
                                        color: color === 'black' || color === 'blue' || color === 'purple' ? 'white' : 'black',
                                        minWidth: '40px'
                                    }}
                                    onClick={() => setCustomization({ ...customization, backgroundColor: color })}
                                >
                                    {color === customization.backgroundColor ? '✓' : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme selector */}
                    <div className="mb-3">
                        <label className="form-label pixel-font" style={{ fontSize: '10px' }}>
                            Theme
                        </label>
                        <select
                            className="form-select"
                            value={customization.theme}
                            onChange={(e) => setCustomization({ ...customization, theme: e.target.value })}
                        >
                            {themes.map((theme) => (
                                <option key={theme} value={theme}>
                                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mood selector (only for pixel art style) */}
                    <div className="mb-3">
                        <label className="form-label pixel-font" style={{ fontSize: '10px' }}>
                            Mood (Pixel Art only)
                        </label>
                        <select
                            className="form-select"
                            value={customization.mood}
                            onChange={(e) => setCustomization({ ...customization, mood: e.target.value })}
                            disabled={customization.style !== 'pixel-art'}
                        >
                            {moods.map((mood) => (
                                <option key={mood} value={mood}>
                                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Save button */}
                    <div className="d-grid">
                        <button
                            className="btn btn-primary pixel-font"
                            onClick={handleSave}
                        >
                            💾 Save Avatar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarCustomizer;