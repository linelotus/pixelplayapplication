import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAvatar } from '../Contexts/AvatarContext';
import AvatarDisplay from '../components/AvatarDisplay';
import '../styles/CollectionPage.css';

// ===================================
// 🎯 IMPORT STATS HOOK FOR REAL-TIME DATA
// ===================================
import { useUserStats } from '../hooks/useUserStats';

const CollectionPage = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { savedAvatars, setCurrentAvatar } = useAvatar();

  // ===================================
  // 📊 USE REAL-TIME STATS
  // ===================================
  const { userStats, loading: statsLoading, refreshStats } = useUserStats();

  const [activeTab, setActiveTab] = useState('myItems');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // Backend URL from environment or default
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    console.log('🚀 CollectionPage mounted');
    fetchBackendData();
  }, []);

  // ===================================
  // 📡 FETCH DATA FROM BACKEND
  // ===================================

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching from backend:', BACKEND_URL);

      // Fetch inventory (public endpoint - no auth required)
      try {
        const inventoryRes = await fetch(`${BACKEND_URL}/api/inventory`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (inventoryRes.ok) {
          const data = await inventoryRes.json();
          console.log('✅ Inventory loaded:', data);
          setItems(data.items || []);
          setBackendConnected(true);
        } else {
          console.log('⚠️ Inventory fetch failed, using empty array');
          setItems([]);
          setBackendConnected(false);
        }
      } catch (error) {
        console.log('⚠️ Inventory fetch error:', error.message);
        setItems([]);
        setBackendConnected(false);
      }

      // Fetch achievements (public endpoint - no auth required)
      try {
        const achievementsRes = await fetch(`${BACKEND_URL}/api/achievements`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (achievementsRes.ok) {
          const data = await achievementsRes.json();
          console.log('✅ Achievements loaded:', data);
          setAchievements(data.achievements || []);
        } else {
          console.log('⚠️ Achievements fetch failed');
          setAchievements([]);
        }
      } catch (error) {
        console.log('⚠️ Achievements fetch error:', error.message);
        setAchievements([]);
      }
    } catch (error) {
      console.error('❌ Error fetching backend data:', error);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // 🛒 PURCHASE ITEM
  // ===================================

  const handlePurchaseItem = async (item) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login to purchase items!');
      return;
    }

    if (userStats.coins < item.price) {
      alert(`Not enough coins! You need ${item.price} but have ${userStats.coins}`);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/purchase/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        fetchBackendData();
        refreshStats(); // Refresh stats after purchase
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert('Failed to purchase item. Please try again.');
    }
  };

  // ===================================
  // ⚙️ EQUIP ITEM
  // ===================================

  const handleEquipItem = async (item) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login to equip items!');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/equip/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        fetchBackendData();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error equipping item:', error);
      alert('Failed to equip item. Please try again.');
    }
  };

  // ===================================
  // 👤 AVATAR ACTIONS
  // ===================================

  const handleUseAvatar = (avatar) => {
    console.log('✅ Setting current avatar:', avatar.name);
    if (setCurrentAvatar) {
      setCurrentAvatar(avatar.settings);
      alert(`Now using avatar: ${avatar.name}! 🎨`);
    }
  };

  const handleEditAvatar = (avatar) => {
    console.log('✏️ Editing avatar:', avatar.name);
    if (onNavigate) {
      onNavigate('editor', avatar);
    } else {
      navigate('/avatar-editor', { state: { avatar } });
    }
  };

  const handleDeleteAvatar = (avatarId) => {
    if (window.confirm('Delete this avatar?')) {
      const currentData = JSON.parse(localStorage.getItem('pixelplay-data') || '{}');
      const updatedAvatars = (currentData.savedAvatars || []).filter(a => a.id !== avatarId);
      localStorage.setItem('pixelplay-data', JSON.stringify({ ...currentData, savedAvatars: updatedAvatars }));
      window.location.reload();
    }
  };

  // ===================================
  // 🔍 FILTER ITEMS WITH SEARCH
  // ===================================

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const ownedItems = filteredItems.filter(item => item.owned);
  const shopItems = filteredItems.filter(item => !item.owned);

  // ===================================
  // 📊 CALCULATE REAL USER STATS
  // ===================================
  const currentLevel = userStats?.level || 1;
  const currentXP = userStats?.xp || 0;
  const currentCoins = userStats?.coins || 0;

  // Calculate level progress with proper XP values
  const currentLevelXP = (currentLevel - 1) * 100;
  const nextLevelXP = currentLevel * 100;
  const xpProgress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  const xpNeeded = nextLevelXP - currentXP;

  if (loading || statsLoading) {
    return (
      <div className="collection-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading Your Collection...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-page">
      {/* ===================================
          📱 HEADER SECTION
          =================================== */}
      <header className="collection-header">
        <div className="header-left">
          <div className="collection-icon">📦</div>
          <div className="header-text">
            <h1 className="collection-title">My Collection</h1>
            <p className="collection-subtitle">Check out all your awesome gear!</p>
          </div>
        </div>

        <div className="header-right">
          {/* REAL USER STATS - LEVEL & XP CARD */}
          <div className="level-xp-card">
            <div className="level-badge">
              <span className="level-icon">⭐</span>
              <div className="level-info">
                <div className="level-text">Level {currentLevel}</div>
                <div className="xp-text">{currentXP} XP</div>
              </div>
            </div>
            <div className="xp-progress-mini">
              <div
                className="xp-progress-fill"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            <div className="xp-next">{xpNeeded > 0 ? `${xpNeeded} XP to Level ${currentLevel + 1}` : 'Max Level!'}</div>
          </div>

          {/* REAL USER COINS DISPLAY */}
          <div className="coins-display">
            <span className="coin-icon">🪙</span>
            <span className="coin-amount">{currentCoins}</span>
          </div>
        </div>
      </header>

      {/* ===================================
          📑 MAIN NAVIGATION TABS
          =================================== */}
      <div className="main-tabs-container">
        <div className="main-tabs">
          <button
            className={`main-tab ${activeTab === 'myItems' ? 'active' : ''}`}
            onClick={() => setActiveTab('myItems')}
          >
            <span className="tab-icon">📦</span>
            <span className="tab-text">My Items</span>
          </button>

          <button
            className={`main-tab ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            <span className="tab-icon">🛒</span>
            <span className="tab-text">Shop</span>
          </button>

          <button
            className={`main-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <span className="tab-icon">🏆</span>
            <span className="tab-text">Achievements</span>
          </button>
        </div>
      </div>

      {/* ===================================
          🔍 FILTERS & SEARCH
          =================================== */}
      {(activeTab === 'myItems' || activeTab === 'shop') && (
        <div className="filters-container">
          <div className="category-filters">
            <button
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <span className="filter-icon">📋</span>
              All Items
            </button>
            <button
              className={`filter-btn ${activeCategory === 'Clothing' ? 'active' : ''}`}
              onClick={() => setActiveCategory('Clothing')}
            >
              <span className="filter-icon">👕</span>
              Clothing
            </button>
            <button
              className={`filter-btn ${activeCategory === 'Accessories' ? 'active' : ''}`}
              onClick={() => setActiveCategory('Accessories')}
            >
              <span className="filter-icon">💎</span>
              Accessories
            </button>
          </div>

          {/* WORKING SEARCH BOX */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      )}

      {/* ===================================
          📋 TAB CONTENT AREA
          =================================== */}
      <div className="tab-content-area">
        {/* MY ITEMS TAB */}
        {activeTab === 'myItems' && (
          <div className="items-grid">
            {ownedItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3 className="empty-title">No items yet!</h3>
                <p className="empty-text">Complete workouts and buy items in the shop!</p>
                <button
                  className="empty-action-btn"
                  onClick={() => setActiveTab('shop')}
                >
                  Visit Shop
                </button>
              </div>
            ) : (
              ownedItems.map(item => (
                <div
                  key={item.id}
                  className={`item-card ${item.equipped ? 'equipped' : ''}`}
                >
                  {item.equipped && (
                    <div className="equipped-indicator">
                      <span className="checkmark">✓</span>
                      Equipped
                    </div>
                  )}

                  <div className="item-visual">
                    <div className="item-icon-large">{item.icon}</div>
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">{item.name}</h3>
                    <p className="item-desc">{item.description}</p>

                    <div className="item-meta">
                      <span className={`rarity-tag rarity-${item.rarity?.toLowerCase()}`}>
                        {item.rarity}
                      </span>
                      <span className="category-tag">{item.category}</span>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button
                      className={`action-btn ${item.equipped ? 'btn-equipped' : 'btn-equip'}`}
                      onClick={() => handleEquipItem(item)}
                    >
                      {item.equipped ? '✓ Equipped' : 'Equip'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SHOP TAB */}
        {activeTab === 'shop' && (
          <div className="items-grid">
            {shopItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <h3 className="empty-title">You Own Everything!</h3>
                <p className="empty-text">Check back later for new items!</p>
              </div>
            ) : (
              shopItems.map(item => {
                const canUnlock = currentLevel >= (item.levelRequired || 1);
                const canAfford = currentCoins >= item.price;
                const isLocked = !canUnlock;

                return (
                  <div
                    key={item.id}
                    className={`item-card shop-item ${isLocked ? 'locked' : ''}`}
                  >
                    {isLocked && (
                      <div className="lock-overlay">
                        <div className="lock-icon">🔒</div>
                        <div className="lock-text">Level {item.levelRequired} Required</div>
                      </div>
                    )}

                    <div className="item-visual">
                      <div className="item-icon-large">{item.icon}</div>
                    </div>

                    <div className="item-details">
                      <h3 className="item-title">{item.name}</h3>
                      <p className="item-desc">{item.description}</p>

                      <div className="item-meta">
                        <span className={`rarity-tag rarity-${item.rarity?.toLowerCase()}`}>
                          {item.rarity}
                        </span>
                        <span className="category-tag">{item.category}</span>
                      </div>

                      <div className="price-tag">
                        <span className="coin-icon">🪙</span>
                        <span className="price-amount">{item.price}</span>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className={`action-btn ${!canUnlock || !canAfford ? 'btn-disabled' : 'btn-buy'}`}
                        disabled={!canUnlock || !canAfford}
                        onClick={() => handlePurchaseItem(item)}
                      >
                        {!canUnlock ? '🔒 Locked' :
                          !canAfford ? '💰 Not Enough Coins' :
                            'Buy Now'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="achievements-container">
            {achievements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏆</div>
                <h3 className="empty-title">No Achievements Yet</h3>
                <p className="empty-text">Complete games and workouts to unlock achievements!</p>
              </div>
            ) : (
              achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon-wrapper">
                    <div className="achievement-icon-large">{achievement.icon}</div>
                    {achievement.unlocked && (
                      <div className="achievement-check">
                        <span className="checkmark">✓</span>
                      </div>
                    )}
                  </div>

                  <div className="achievement-info">
                    <h3 className="achievement-title">{achievement.name}</h3>
                    <p className="achievement-desc">{achievement.description}</p>

                    {achievement.reward && (
                      <div className="achievement-reward">
                        <span className="reward-icon">💰</span>
                        <span className="reward-text">{achievement.reward} coins</span>
                      </div>
                    )}

                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="achievement-progress-container">
                        <div className="achievement-progress-bar">
                          <div
                            className="achievement-progress-fill"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <span className="achievement-progress-text">
                          {achievement.progress}% Complete
                        </span>
                      </div>
                    )}

                    {achievement.unlocked && (
                      <div className="unlocked-badge">
                        <span className="badge-icon">✓</span>
                        <span className="badge-text">Unlocked!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ===================================
          📊 STATS SUMMARY BAR
          =================================== */}
      <div className="stats-summary-bar">
        <div className="summary-stat">
          <span className="summary-icon">👤</span>
          <div className="summary-info">
            <div className="summary-number">{savedAvatars?.length || 0}</div>
            <div className="summary-label">Avatars</div>
          </div>
        </div>

        <div className="summary-stat">
          <span className="summary-icon">📦</span>
          <div className="summary-info">
            <div className="summary-number">{ownedItems.length}</div>
            <div className="summary-label">Items Owned</div>
          </div>
        </div>

        <div className="summary-stat">
          <span className="summary-icon">🏆</span>
          <div className="summary-info">
            <div className="summary-number">{achievements.filter(a => a.unlocked).length}</div>
            <div className="summary-label">Achievements</div>
          </div>
        </div>

        <div className="summary-stat">
          <span className="summary-icon">🎮</span>
          <div className="summary-info">
            <div className="summary-number">{userStats?.totalGamesPlayed || 0}</div>
            <div className="summary-label">Games Played</div>
          </div>
        </div>
      </div>

      {/* ===================================
          🎮 BOTTOM NAVIGATION
          =================================== */}
      <div className="bottom-navigation-bar">
        <button
          className="nav-button nav-button-secondary"
          onClick={() => onNavigate ? onNavigate('dashboard') : navigate('/dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Back to Dashboard</span>
        </button>

        <button
          className="nav-button nav-button-primary"
          onClick={() => onNavigate ? onNavigate('editor') : navigate('/avatar-editor')}
        >
          <span className="nav-icon">🎨</span>
          <span className="nav-text">Edit Avatar</span>
        </button>

        <button
          className="nav-button nav-button-accent"
          onClick={() => navigate('/')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Home</span>
        </button>
      </div>
    </div>
  );
};

export default CollectionPage;