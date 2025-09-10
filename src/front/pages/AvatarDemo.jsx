import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState } from "react";
import AvatarDisplay from "../components/AvatarDisplay";  // Import real component
import mockUsers from "../data/mockUsers";  // Import mock data
import "../styles/avatarStyles.css";  // Import CSS (you'll need to create this)

export const AvatarDemo = () => {
  const { store, dispatch } = useGlobalReducer();
  const [activeDemo, setActiveDemo] = useState('display');

  const handleLevelUp = (userId) => {
    dispatch({
      type: "level_up_user",
      payload: { userId: userId }
    });
    alert(`User ${userId} leveled up!`);
  };

  return (
    <div className="container">
      <div className="text-center my-4">
        <h1 className="mb-4">🎮 Avatar Demo</h1>
        <p className="lead">Interactive avatar display system</p>
      </div>

      {/* Demo Navigation */}
      <div className="text-center mb-4">
        <div className="btn-group" role="group">
          <button 
            className={`btn ${activeDemo === 'display' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveDemo('display')}
          >
            Display Demo
          </button>
          <button 
            className={`btn ${activeDemo === 'users' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveDemo('users')}
          >
            User Gallery
          </button>
          <button 
            className={`btn ${activeDemo === 'setup' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveDemo('setup')}
          >
            Setup Guide
          </button>
        </div>
      </div>

      {/* Display Demo - Now with real avatars */}
      {activeDemo === 'display' && (
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Avatar Display Variations</h4>
            <div className="row">
              <div className="col-md-4 text-center mb-3">
                <h6>Small Avatar (60px)</h6>
                <AvatarDisplay 
                  user={mockUsers[0]} 
                  size={60} 
                  showLevel={true} 
                />
                <small className="text-muted">{mockUsers[0].username} - Level {mockUsers[0].level}</small>
              </div>
              <div className="col-md-4 text-center mb-3">
                <h6>Medium Avatar (100px)</h6>
                <AvatarDisplay 
                  user={mockUsers[1]} 
                  size={100} 
                  showLevel={true} 
                />
                <small className="text-muted">{mockUsers[1].username} - Level {mockUsers[1].level}</small>
              </div>
              <div className="col-md-4 text-center mb-3">
                <h6>Large Avatar (150px)</h6>
                <AvatarDisplay 
                  user={mockUsers[2]} 
                  size={150} 
                  showLevel={true} 
                  showCustomization={true}
                />
                <small className="text-muted">{mockUsers[2].username} - Level {mockUsers[2].level}</small>
              </div>
            </div>
            <div className="alert alert-success">
              <strong>Success!</strong> Real avatars are now generating using DiceBear library!
            </div>
          </div>
        </div>
      )}

      {/* User Gallery - Now with real avatars */}
      {activeDemo === 'users' && (
        <div>
          <ul className="list-group">
            {mockUsers.map((user) => {
              return (
                <li
                  key={user.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <AvatarDisplay 
                      user={user} 
                      size={50} 
                      showLevel={false}
                      className="me-3"
                    />
                    <div>
                      <Link to={"/single/" + user.id}>
                        <strong>{user.username}</strong>
                      </Link>
                      <br />
                      <small className="text-muted">
                        Level {user.level} • {user.avatarData.theme} theme • {user.avatarData.style} style
                      </small>
                    </div>
                  </div>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => handleLevelUp(user.id)}
                  >
                    Level Up
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Setup Guide */}
      {activeDemo === 'setup' && (
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Setup Complete!</h4>
            <div className="alert alert-success">
              <strong>✅ DiceBear packages installed</strong><br/>
              <strong>✅ Avatar components added</strong><br/>
              <strong>✅ Routes configured</strong><br/>
              <strong>✅ Real avatars generating</strong>
            </div>
            <h5>Next Steps:</h5>
            <ul>
              <li>Connect avatars to your Flask backend API</li>
              <li>Add user authentication</li>
              <li>Implement level progression system</li>
              <li>Add avatar customization features</li>
            </ul>
            <p>Your avatar system is now fully functional with the DiceBear library!</p>
          </div>
        </div>
      )}

      <br />
      <Link to="/">
        <button className="btn btn-primary">Back home</button>
      </Link>
    </div>
  );
};