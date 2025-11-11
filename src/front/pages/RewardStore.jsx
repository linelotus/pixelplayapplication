import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, LayoutDashboard, CheckCircle, Lock, Check, ShoppingCart } from 'lucide-react';
import '../styles/Dashboard.css';

const RewardStore = ({ userId, userName, onPurchase }) => {
    const navigate = useNavigate();
    const [userPoints, setUserPoints] = useState(150);
    const [loading, setLoading] = useState(false);
    const [purchasing, setPurchasing] = useState(null);
    const [ownedRewards, setOwnedRewards] = useState([]);
    const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(null);

    const rewards = [
        {
            id: 'fitness_master',
            name: 'Fitness Master',
            description: 'Show everyone you love staying active!',
            cost: 120,
            emoji: '💪',
            category: 'Achievement'
        },
        {
            id: 'early_bird',
            name: 'Early Bird',
            description: 'For those who love morning workouts',
            cost: 80,
            emoji: '🌅',
            category: 'Time'
        },
        {
            id: 'streak_champion',
            name: 'Streak Champion',
            description: 'Consistency is key!',
            cost: 200,
            emoji: '🔥',
            category: 'Achievement'
        },
        {
            id: 'dance_star',
            name: 'Dance Star',
            description: 'You have the best moves!',
            cost: 90,
            emoji: '💃',
            category: 'Activity'
        },
        {
            id: 'healthy_eater',
            name: 'Healthy Eater',
            description: 'Great food choices!',
            cost: 70,
            emoji: '🥗',
            category: 'Nutrition'
        },
        {
            id: 'water_champion',
            name: 'Water Champion',
            description: 'Staying hydrated like a pro!',
            cost: 60,
            emoji: '💧',
            category: 'Nutrition'
        },
        {
            id: 'super_sleeper',
            name: 'Super Sleeper',
            description: 'Getting great rest every night!',
            cost: 85,
            emoji: '😴',
            category: 'Wellness'
        },
        {
            id: 'goal_crusher',
            name: 'Goal Crusher',
            description: 'Nothing can stop you!',
            cost: 180,
            emoji: '🎯',
            category: 'Achievement'
        },
    ];

    useEffect(() => {
        loadUserData();
    }, [userId]);

    const loadUserData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/rewards/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserPoints(data.points || 0);
                setOwnedRewards(data.owned_rewards || []);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (reward) => {
        if (purchasing || userPoints < reward.cost) return;

        setPurchasing(reward.id);

        try {
            const response = await fetch(`/api/rewards/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    reward_id: reward.id,
                    cost: reward.cost
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUserPoints(data.remaining_points);
                setOwnedRewards([...ownedRewards, reward.id]);
                setShowPurchaseConfirm(reward);

                onPurchase && onPurchase(reward, data.remaining_points);

                setTimeout(() => {
                    setShowPurchaseConfirm(null);
                }, 3000);

            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Purchase failed. Please try again!');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Oops! Something went wrong. Please try again!');
        } finally {
            setPurchasing(null);
        }
    };

    const handleNavigation = (path) => {
        setLoading(true);
        setTimeout(() => {
            navigate(path);
        }, 300);
    };

    const canAfford = (cost) => userPoints >= cost;
    const isOwned = (rewardId) => ownedRewards.includes(rewardId);

    if (loading) {
        return (
            <div className="page-loading">
                <div className="loading-spinner"></div>
                <p>Loading rewards...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to right top, #fb735f, #ff6871, #ff5f85, #ff599c, #ff58b5, #fa5ec4, #f365d2, #eb6ce0, #df74e4, #d37be6, #c881e7, #bd86e7)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Purchase Confirmation Toast */}
            {showPurchaseConfirm && (
                <div style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: 'white',
                    padding: '1.5rem 2rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: 'slideInRight 0.3s ease'
                }}>
                    <div style={{ fontSize: '2rem' }}>{showPurchaseConfirm.emoji}</div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                            Purchase Successful!
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                            You got {showPurchaseConfirm.name}! 🎉
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Bar */}
            <nav style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '1rem 2rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => handleNavigation('/dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'white',
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                color: '#374151',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#8B5CF6';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#E5E7EB';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            <ArrowLeft size={20} />
                            <span>Back</span>
                        </button>

                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: '#1F2937',
                            margin: 0
                        }}>🎁 Reward Store</h1>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => handleNavigation('/dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'white',
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                color: '#374151',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#8B5CF6';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#E5E7EB';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/habit-tracker')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <CheckCircle size={20} />
                            <span>Track Progress</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '2rem'
            }}>
                {/* Header Section */}
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: '#1F2937',
                            margin: '0 0 0.5rem 0'
                        }}>🎁 Reward Store 🎁</h1>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6B7280',
                            margin: '0 0 1.5rem 0'
                        }}>Use your points to buy awesome rewards!</p>

                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 2rem',
                            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>⭐</span>
                            <span>{userPoints} Points</span>
                        </div>
                    </div>
                </section>

                {/* Rewards Grid */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {rewards.map(reward => {
                            const owned = isOwned(reward.id);
                            const affordable = canAfford(reward.cost);
                            const isPurchasing = purchasing === reward.id;

                            return (
                                <div
                                    key={reward.id}
                                    style={{
                                        position: 'relative',
                                        background: owned ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '20px',
                                        border: owned ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                            {reward.emoji}
                                        </div>
                                        <h3 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            color: '#1F2937',
                                            margin: '0 0 0.5rem 0'
                                        }}>
                                            {reward.name}
                                        </h3>
                                        <p style={{
                                            color: '#6B7280',
                                            fontSize: '0.9rem',
                                            margin: '0 0 1rem 0',
                                            lineHeight: '1.5'
                                        }}>
                                            {reward.description}
                                        </p>

                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            background: owned ? '#10B981' : affordable ? '#8B5CF6' : '#9CA3AF',
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '1.125rem',
                                            fontWeight: '700',
                                            marginBottom: '1rem'
                                        }}>
                                            <span>⭐</span>
                                            <span>{reward.cost}</span>
                                        </div>

                                        <div>
                                            {owned ? (
                                                <button
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '16px',
                                                        fontWeight: '700',
                                                        fontSize: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        border: 'none',
                                                        cursor: 'not-allowed',
                                                        background: '#10B981',
                                                        color: 'white',
                                                        opacity: 0.8
                                                    }}
                                                    disabled
                                                >
                                                    <Check size={20} />
                                                    <span>Owned</span>
                                                </button>
                                            ) : affordable ? (
                                                <button
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '16px',
                                                        fontWeight: '700',
                                                        fontSize: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        border: 'none',
                                                        cursor: isPurchasing ? 'not-allowed' : 'pointer',
                                                        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                                                        color: 'white',
                                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onClick={() => handlePurchase(reward)}
                                                    disabled={isPurchasing}
                                                    onMouseEnter={(e) => {
                                                        if (!isPurchasing) {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                                                    }}
                                                >
                                                    {isPurchasing ? (
                                                        <>⏳ Buying...</>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart size={20} />
                                                            <span>Buy Now</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '16px',
                                                        fontWeight: '700',
                                                        fontSize: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        border: 'none',
                                                        cursor: 'not-allowed',
                                                        background: '#E5E7EB',
                                                        color: '#9CA3AF'
                                                    }}
                                                    disabled
                                                >
                                                    <Lock size={20} />
                                                    <span>Need {reward.cost - userPoints} More</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {owned && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            background: '#10B981',
                                            fontSize: '1.25rem'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Owned Rewards Section */}
                {ownedRewards.length > 0 ? (
                    <section>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '24px',
                            padding: '2rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: '#1F2937',
                                textAlign: 'center',
                                marginBottom: '2rem'
                            }}>
                                🎉 My Earned Rewards 🎉
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '1rem'
                            }}>
                                {rewards
                                    .filter(reward => ownedRewards.includes(reward.id))
                                    .map(reward => (
                                        <div key={reward.id} style={{
                                            background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                            border: '2px solid #10B981'
                                        }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                                                {reward.emoji}
                                            </div>
                                            <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.9rem' }}>
                                                {reward.name}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </section>
                ) : (
                    <section>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '24px',
                            padding: '3rem 2rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⭐</div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: '#1F2937',
                                marginBottom: '0.5rem'
                            }}>
                                Start Your Collection!
                            </h3>
                            <p style={{ color: '#6B7280', fontSize: '1rem' }}>
                                Complete activities to earn points and buy your first reward! 💪
                            </p>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default RewardStore;