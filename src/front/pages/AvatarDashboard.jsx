import { useState, useEffect } from "react";
import AvatarDisplay from "../components/AvatarDisplay";

// Embedded demo data - independent of other pages
const initialUsers = [
  {
    id: 1,
    username: 'PixelHero',
    email: 'pixel@example.com',
    level: 15,
    avatarData: { 
      style: 'pixel-art', 
      seed: 'PixelHero', 
      backgroundColor: 'blue', 
      theme: 'superhero',
      mood: 'happy'
    }
  },
  {
    id: 2,
    username: 'SpaceExplorer',
    email: 'space@example.com',
    level: 8,
    avatarData: { 
      style: 'bottts', 
      seed: 'SpaceExplorer', 
      backgroundColor: 'purple', 
      theme: 'space',
      mood: 'surprised'
    }
  },
  {
    id: 3,
    username: 'NinjaWarrior',
    email: 'ninja@example.com',
    level: 22,
    avatarData: { 
      style: 'personas', 
      seed: 'NinjaWarrior', 
      backgroundColor: 'black', 
      theme: 'ninja',
      mood: 'neutral'
    }
  }
];

export const AvatarDashboard = () => {
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(initialUsers[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('checking');
  const [stats, setStats] = useState({
    totalUsers: initialUsers.length,
    averageLevel: Math.round(initialUsers.reduce((sum, user) => sum + user.level, 0) / initialUsers.length),
    highestLevel: Math.max(...initialUsers.map(user => user.level))
  });

  // API integration functions
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/hello');
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  const saveUserToApi = async (user) => {
    try {
      const response = await fetch('/api/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          style: user.avatarData.style,
          backgroundColor: user.avatarData.backgroundColor,
          theme: user.avatarData.theme,
          mood: user.avatarData.mood
        }),
      });
      
      if (response.ok) {
        console.log('User saved to API successfully');
        return true;
      }
    } catch (error) {
      console.log('API save failed, using local state');
    }
    return false;
  };

  const loadUsersFromApi = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const apiUsers = await response.json();
        if (apiUsers.length > 0) {
          setUsers(apiUsers);
          setCurrentUser(apiUsers[0]);
          updateStats(apiUsers);
        }
      }
    } catch (error) {
      console.log('Loading from API failed, using mock data');
    }
  };

  const updateStats = (userList) => {
    setStats({
      totalUsers: userList.length,
      averageLevel: Math.round(userList.reduce((sum, user) => sum + user.level, 0) / userList.length),
      highestLevel: Math.max(...userList.map(user => user.level))
    });
  };

  const handleLevelUp = async (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, level: user.level + 1 } : user
    );
    setUsers(updatedUsers);
    updateStats(updatedUsers);
    
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, level: currentUser.level + 1 });
    }

    // Try to save to API
    try {
      await fetch(`/api/users/${userId}/level-up`, { method: 'POST' });
    } catch (error) {
      console.log('API level-up failed, using local state');
    }
  };

  const handleAvatarCustomization = async (userId, customization) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, avatarData: { ...user.avatarData, ...customization } }
        : user
    );
    setUsers(updatedUsers);
    
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, avatarData: { ...currentUser.avatarData, ...customization } });
    }

    // Try to save to API
    const userToSave = updatedUsers.find(u => u.id === userId);
    await saveUserToApi(userToSave);
  };

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
    loadUsersFromApi();
  }, []);

  const availableStyles = [
    { id: 'pixel-art', name: 'Pixel Art', requiredLevel: 1 },
    { id: 'identicon', name: 'Geometric', requiredLevel: 3 },
    { id: 'bottts', name: 'Robots', requiredLevel: 5 },
    { id: 'shapes', name: 'Abstract', requiredLevel: 8 },
    { id: 'adventurer', name: 'Adventurer', requiredLevel: 10 },
    { id: 'big-ears', name: 'Big Ears', requiredLevel: 12 },
    { id: 'croodles', name: 'Croodles', requiredLevel: 15 },
    { id: 'personas', name: 'Personas', requiredLevel: 18 },
    { id: 'miniavs', name: 'Mini Avatars', requiredLevel: 20 }
  ];

  const availableThemes = ['superhero', 'space', 'nature', 'princess', 'ninja', 'pirate'];
  const availableColors = ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'yellow', 'black'];
  const availableMoods = ['happy', 'sad', 'surprised', 'angry', 'neutral'];

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="text-white mb-1">PixelPlay Avatar System</h1>
                <p className="text-white-50">Complete avatar management dashboard</p>
              </div>
              <div className="d-flex gap-2">
                <span className={`badge ${apiStatus === 'connected' ? 'bg-success' : apiStatus === 'disconnected' ? 'bg-danger' : 'bg-warning'}`}>
                  API: {apiStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : 'text-white'}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'demo' ? 'active' : 'text-white'}`}
                  onClick={() => setActiveTab('demo')}
                >
                  Demo Gallery
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'api' ? 'active' : 'text-white'}`}
                  onClick={() => setActiveTab('api')}
                >
                  API Testing
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <h4 className="card-title">{stats.totalUsers}</h4>
                    <p className="card-text">Total Users</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <h4 className="card-title">{stats.averageLevel}</h4>
                    <p className="card-text">Average Level</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-warning text-white">
                  <div className="card-body">
                    <h4 className="card-title">{stats.highestLevel}</h4>
                    <p className="card-text">Highest Level</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="row">
              <div className="col-md-8">
                {/* Current User Panel */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Current User: {currentUser.username}</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 text-center">
                        <AvatarDisplay 
                          user={currentUser} 
                          size={200} 
                          showLevel={true} 
                          showCustomization={false}
                          newlyUnlocked={currentUser.level >= 20}
                        />
                        <h4 className="mt-3">{currentUser.username}</h4>
                        <p className="text-muted">Level {currentUser.level} • {currentUser.avatarData.theme} theme</p>
                        <button 
                          className="btn btn-success me-2"
                          onClick={() => handleLevelUp(currentUser.id)}
                        >
                          Level Up
                        </button>
                      </div>
                      <div className="col-md-6">
                        <h6>Customization</h6>
                        
                        <div className="mb-3">
                          <label className="form-label">Theme</label>
                          <select 
                            className="form-select"
                            value={currentUser.avatarData.theme}
                            onChange={(e) => handleAvatarCustomization(currentUser.id, { theme: e.target.value })}
                          >
                            {availableThemes.map(theme => (
                              <option key={theme} value={theme}>{theme}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Background Color</label>
                          <div className="d-flex flex-wrap gap-1">
                            {availableColors.map(color => (
                              <button
                                key={color}
                                className={`btn btn-sm ${currentUser.avatarData.backgroundColor === color ? 'btn-primary' : 'btn-outline-secondary'}`}
                                style={{ 
                                  backgroundColor: color === 'black' ? '#000' : color,
                                  color: ['black', 'blue', 'purple'].includes(color) ? 'white' : 'black',
                                  minWidth: '30px',
                                  height: '30px'
                                }}
                                onClick={() => handleAvatarCustomization(currentUser.id, { backgroundColor: color })}
                              >
                                {currentUser.avatarData.backgroundColor === color ? '✓' : ''}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Style</label>
                          <select 
                            className="form-select"
                            value={currentUser.avatarData.style}
                            onChange={(e) => handleAvatarCustomization(currentUser.id, { style: e.target.value })}
                          >
                            {availableStyles.map(style => (
                              <option 
                                key={style.id} 
                                value={style.id}
                                disabled={currentUser.level < style.requiredLevel}
                              >
                                {style.name} {currentUser.level < style.requiredLevel ? `(Level ${style.requiredLevel} required)` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Mood</label>
                          <select 
                            className="form-select"
                            value={currentUser.avatarData.mood}
                            onChange={(e) => handleAvatarCustomization(currentUser.id, { mood: e.target.value })}
                          >
                            {availableMoods.map(mood => (
                              <option key={mood} value={mood}>{mood}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Gallery */}
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">All Users</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {users.map((user) => (
                        <div key={user.id} className="col-md-4 mb-3">
                          <div className={`card ${currentUser.id === user.id ? 'border-primary' : ''}`}>
                            <div className="card-body text-center">
                              <AvatarDisplay 
                                user={user} 
                                size={80} 
                                showLevel={true}
                                clickable={true}
                                onAvatarClick={() => setCurrentUser(user)}
                              />
                              <h6 className="mt-2">{user.username}</h6>
                              <small className="text-muted">Level {user.level}</small>
                              <div className="mt-2">
                                <button 
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => setCurrentUser(user)}
                                >
                                  Select
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleLevelUp(user.id)}
                                >
                                  Level Up
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Style Progression</h6>
                  </div>
                  <div className="card-body">
                    {availableStyles.map(style => (
                      <div key={style.id} className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className={currentUser.level >= style.requiredLevel ? 'text-success' : 'text-muted'}>
                            {style.name}
                          </span>
                          <br />
                          <small className="text-muted">Level {style.requiredLevel}</small>
                        </div>
                        <div>
                          {currentUser.level >= style.requiredLevel ? (
                            <span className="badge bg-success">Unlocked</span>
                          ) : (
                            <span className="badge bg-secondary">Locked</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Avatar Display Demo</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center mb-4">
                  <h6>Small (60px)</h6>
                  <AvatarDisplay user={users[0]} size={60} showLevel={true} />
                  <p className="mt-2">{users[0].username}</p>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Medium (100px)</h6>
                  <AvatarDisplay user={users[1]} size={100} showLevel={true} />
                  <p className="mt-2">{users[1].username}</p>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Large (150px)</h6>
                  <AvatarDisplay user={users[2]} size={150} showLevel={true} showCustomization={true} />
                  <p className="mt-2">{users[2].username}</p>
                </div>
              </div>
              
              <div className="alert alert-info mt-4">
                <h6>Demo Features:</h6>
                <ul className="mb-0">
                  <li>Multiple avatar sizes and configurations</li>
                  <li>Level badges and customization buttons</li>
                  <li>Different avatar styles (pixel art, robots, personas)</li>
                  <li>Theme-based color schemes</li>
                  <li>Real-time avatar generation with DiceBear</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">API Integration Status</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>API Endpoints:</h6>
                  <ul>
                    <li><code>GET /api/hello</code> - Health check</li>
                    <li><code>GET /api/users</code> - Get all users</li>
                    <li><code>PUT /api/avatar</code> - Update avatar</li>
                    <li><code>POST /api/users/{`{id}`}/level-up</code> - Level up user</li>
                    <li><code>GET /api/avatar-styles</code> - Get available styles</li>
                    <li><code>GET /api/avatar-themes</code> - Get available themes</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Current Status:</h6>
                  <div className={`alert ${apiStatus === 'connected' ? 'alert-success' : 'alert-warning'}`}>
                    <strong>API Status:</strong> {apiStatus}
                    <br />
                    {apiStatus === 'connected' && 'All features fully functional with database persistence'}
                    {apiStatus === 'disconnected' && 'Using local state only - changes will not persist'}
                    {apiStatus === 'error' && 'API errors detected - some features may not work'}
                  </div>
                  <button className="btn btn-primary" onClick={checkApiStatus}>
                    Refresh API Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};