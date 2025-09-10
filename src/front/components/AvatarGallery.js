// Avatar Gallery Component
// Shows multiple avatars together, like a photo album

import React, { useState } from "react";
import AvatarDisplay from "./AvatarDisplay.js";
import mockUsers from "../data/mockUsers.js";

const AvatarGallery = ({ users = mockUsers, onAvatarSelect }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  // When someone clicks an avatar in the gallery
  const handleAvatarClick = (user) => {
    setSelectedUser(user);
    if (onAvatarSelect) {
      onAvatarSelect(user);
    }
  };

  return (
    <div className="p-4">
      <h3 className="pixel-font mb-4">🎨 Avatar Gallery</h3>

      {/* Grid of avatars */}
      <div className="row">
        {users.map((user) => (
          <div key={user.id} className="col-md-4 mb-4">
            <div className="text-center">
              <AvatarDisplay
                user={user}
                size={120}
                showLevel={true}
                showCustomization={true}
                clickable={true}
                onAvatarClick={handleAvatarClick}
                onCustomizeClick={() => console.log("Customize", user.username)}
                className="mb-2"
                newlyUnlocked={user.level >= 20} // High-level users get glow effect
              />
              {/* User name and level below avatar */}
              <div className="pixel-font" style={{ fontSize: "12px" }}>
                {user.username}
              </div>
              <small className="text-muted">Level {user.level}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Show details of selected user */}
      {selectedUser && (
        <div className="mt-4 p-3 bg-light border rounded">
          <h5>Selected: {selectedUser.username}</h5>
          <p>Level: {selectedUser.level}</p>
          <p>Style: {selectedUser.avatarData.style}</p>
          <p>Theme: {selectedUser.avatarData.theme}</p>
        </div>
      )}
    </div>
  );
};

export default AvatarGallery;
