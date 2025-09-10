import React, { useState, useEffect, useCallback } from 'react';
import DiceBearService from '../service/DiceBearService';

const AvatarDisplay = ({
    user,
    size = 150,
    showLevel = true,
    showCustomization = false,
    showUnlockBadge = false,
    clickable = false,
    theme = null,
    className = "",
    onAvatarClick = null,
    onCustomizeClick = null,
    newlyUnlocked = false
}) => {
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.avatarData) {
            setLoading(false);
            setError('No user data provided');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const url = DiceBearService.generateAvatarUrl(
                user.avatarData.seed || user.username || 'default',
                {
                    style: user.avatarData.style || 'pixel-art',
                    backgroundColor: user.avatarData.backgroundColor || 'blue',
                    theme: theme || user.avatarData.theme,
                    mood: user.avatarData.mood || 'happy'
                }
            );

            setAvatarUrl(url);
            setLoading(false);
        } catch (err) {
            console.error('Avatar generation error:', err);
            setError('Failed to generate avatar');
            setLoading(false);
        }
    }, [user, size, theme]);

    const handleAvatarClick = useCallback(() => {
        if (clickable && onAvatarClick) {
            onAvatarClick(user);
        }
    }, [clickable, onAvatarClick, user]);

    const handleCustomizeClick = useCallback((e) => {
        e.stopPropagation();
        if (onCustomizeClick) {
            onCustomizeClick(user);
        }
    }, [onCustomizeClick, user]);

    if (loading) {
        return (
            <div
                className={`avatar-container ${className}`}
                style={{ width: size, height: size }}
            >
                <div
                    className="avatar-border loading-shimmer"
                    style={{ width: size, height: size }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                        }}
                    >
                        ⏳
                    </div>
                </div>
            </div>
        );
    }

    if (error || !avatarUrl) {
        return (
            <div
                className={`avatar-container ${className}`}
                style={{ width: size, height: size }}
            >
                <div
                    className="avatar-border avatar-error"
                    style={{ width: size, height: size }}
                >
                    <span>❓</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`avatar-container ${className}`}
            style={{ width: size, height: size }}
        >
            {showUnlockBadge && (
                <div className="style-unlock-badge">
                    NEW!
                </div>
            )}

            <div
                className={`avatar-border ${clickable ? 'avatar-clickable' : ''} ${newlyUnlocked ? 'achievement-glow' : ''}`}
                style={{ width: size, height: size }}
                onClick={handleAvatarClick}
                title={user ? `${user.username} - Level ${user.level}` : 'Avatar'}
            >
                <img
                    src={avatarUrl}
                    alt={`${user?.username || 'User'}'s avatar`}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />
            </div>

            {showLevel && user?.level && (
                <div className="level-badge pixel-font">
                    {user.level}
                </div>
            )}

            {showCustomization && (
                <button
                    className="customize-btn"
                    onClick={handleCustomizeClick}
                    title="Customize Avatar"
                >
                    ✏️
                </button>
            )}
        </div>
    );
};

export default AvatarDisplay;