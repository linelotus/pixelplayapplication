// Avatar Style Selector Component
// Lets users choose different avatar styles (if they've unlocked them)

import React, { useState } from 'react';
import AvatarDisplay from './AvatarDisplay.js';
import DiceBearService from '../services/DiceBearService.js';

const AvatarStyleSelector = ({
    userLevel = 1,
    currentStyle = 'pixel-art',
    onStyleSelect
}) => {
    const [selectedStyle, setSelectedStyle] = useState(currentStyle);

    // Get styles this user has unlocked based on their level
    const unlockedStyles = DiceBearService.getUnlockedStyles(userLevel);
    // Get the next style they can unlock
    const nextUnlock = DiceBearService.getNextUnlock(userLevel);

    // When user picks a style
    const handleStyleSelect = (styleId) => {
        setSelectedStyle(styleId);
        if (onStyleSelect) {
            onStyleSelect(styleId);
        }
    };

    return (
        <div className="p-4">
            <h4 className="pixel-font mb-3">🎭 Avatar Styles</h4>

            <div className="row">
                {/* Show all unlocked styles */}
                {unlockedStyles.map((style) => (
                    <div key={style.id} className="col-md-3 mb-3">
                        <div
                            className={`card text-center cursor-pointer ${selectedStyle === style.id ? 'border-primary' : ''}`}
                            onClick={() => handleStyleSelect(style.id)}
                        >
                            <div className="card-body">
                                {/* Preview of this style */}
                                <AvatarDisplay
                                    user={{
                                        username: 'preview',
                                        level: userLevel,
                                        avatarData: {
                                            style: style.id,
                                            seed: 'preview',
                                            backgroundColor: 'blue'
                                        }
                                    }}
                                    size={80}
                                    showLevel={false}
                                    className="mb-2"
                                />
                                <div className="pixel-font" style={{ fontSize: '10px' }}>
                                    {style.name}
                                </div>
                                <small className="text-success">✓ Unlocked</small>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Show next unlock (locked style) */}
                {nextUnlock && (
                    <div className="col-md-3 mb-3">
                        <div className="card text-center border-warning">
                            <div className="card-body">
                                {/* Locked icon instead of preview */}
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        margin: '0 auto 8px',
                                        background: '#f8f9fa',
                                        border: '2px dashed #ccc',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}
                                >
                                    🔒
                                </div>
                                <div className="pixel-font" style={{ fontSize: '10px' }}>
                                    {nextUnlock.name}
                                </div>
                                <small className="text-warning">
                                    Level {nextUnlock.requiredLevel}
                                </small>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress info */}
            <div className="mt-3 p-3 bg-info text-white rounded">
                <small>
                    <strong>Unlocked:</strong> {unlockedStyles.length} styles |
                    <strong> Next unlock:</strong> {nextUnlock ? `Level ${nextUnlock.requiredLevel} (${nextUnlock.levelsNeeded} more levels)` : 'All unlocked!'}
                </small>
            </div>
        </div>
    );
};

export default AvatarStyleSelector;