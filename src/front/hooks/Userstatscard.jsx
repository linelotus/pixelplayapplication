import React from 'react';
import { useUserStats } from './useUserStats'; // Adjust path as needed
import { Star, Trophy, Zap, TrendingUp } from 'lucide-react';

/**
 * 🎮 UserStatsCard Component
 * 
 * Beautiful stats card that displays user progress.
 * Use this on your Dashboard, Home page, or Profile page!
 * 
 * Props:
 * - variant: 'compact' | 'full' (default: 'full')
 * - showRefreshButton: boolean (default: false)
 */

const UserStatsCard = ({ variant = 'full', showRefreshButton = false }) => {
    const { userStats, loading, refreshStats } = useUserStats();

    if (loading) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '1.2rem' }}>Loading your stats... 🎮</div>
            </div>
        );
    }

    // Calculate level progress
    const currentLevelXP = (userStats.level - 1) * 100;
    const nextLevelXP = userStats.level * 100;
    const xpInCurrentLevel = userStats.xp - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    const levelProgress = (xpInCurrentLevel / xpNeededForLevel) * 100;

    if (variant === 'compact') {
        // Compact version for sidebars or smaller spaces
        return (
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: 'white'
            }}>
                <h3 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Trophy size={24} />
                    Your Progress
                </h3>
                
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Level</span>
                        <strong style={{ fontSize: '1.2rem' }}>{userStats.level}</strong>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>XP</span>
                        <strong>{userStats.xp}</strong>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Coins</span>
                        <strong>🪙 {userStats.coins}</strong>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Streak</span>
                        <strong>🔥 {userStats.weeklyStreak}d</strong>
                    </div>
                </div>

                {showRefreshButton && (
                    <button
                        onClick={refreshStats}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Refresh Stats
                    </button>
                )}
            </div>
        );
    }

    // Full version for Dashboard main area
    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '2rem',
            color: 'white',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '2rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <Trophy size={32} />
                    Your Stats
                </h2>
                
                {showRefreshButton && (
                    <button
                        onClick={refreshStats}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        🔄 Refresh
                    </button>
                )}
            </div>

            {/* Main Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Level Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        <Star size={24} style={{ color: '#fbbf24' }} />
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Level</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{userStats.level}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                        {xpInCurrentLevel}/{xpNeededForLevel} XP to next
                    </div>
                </div>

                {/* XP Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        <Zap size={24} style={{ color: '#fbbf24' }} />
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total XP</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{userStats.xp}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Experience Points</div>
                </div>

                {/* Coins Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🪙</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Coins</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{userStats.coins}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Ready to spend!</div>
                </div>

                {/* Streak Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🔥</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Streak</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{userStats.weeklyStreak}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Days in a row!</div>
                </div>
            </div>

            {/* Level Progress Bar */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                        <TrendingUp size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        Progress to Level {userStats.level + 1}
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                        {Math.round(levelProgress)}%
                    </span>
                </div>
                
                <div style={{
                    width: '100%',
                    height: '16px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${levelProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        transition: 'width 0.5s ease',
                        borderRadius: '8px'
                    }} />
                </div>
                
                <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: 0.9,
                    textAlign: 'center'
                }}>
                    {xpNeededForLevel - xpInCurrentLevel} XP needed to level up!
                </div>
            </div>

            {/* Additional Stats */}
            <div style={{
                marginTop: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    flex: 1,
                    minWidth: '150px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{userStats.totalGamesPlayed}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Games Played</div>
                </div>
                
                <div style={{
                    flex: 1,
                    minWidth: '150px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{userStats.unlockedGames.length}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Games Unlocked</div>
                </div>
            </div>
        </div>
    );
};

export default UserStatsCard;