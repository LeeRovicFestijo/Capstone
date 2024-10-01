import React, { useState } from "react";
import "./profile.css";

const Profile = ({ closeProfile }) => {
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
    closeProfile();
  };

  const handleProfileClick = () => {
    setShowProfileDetails(true);
  };

  return (
    <div className="profile-sidebar">
      {/* Conditionally render the Back Button only when not showing profile details */}
      {!showProfileDetails && (
        <button 
          className="back-button" 
          onClick={closeProfile} 
          aria-label="Close Profile"
        >
          &gt; {/* Right-facing angle bracket */}
        </button>
      )}

      <div className="profile-content">
        {!showProfileDetails ? (
          <div className="menu-options">
            <h3>Menu</h3>
            <button className="profile-button" onClick={handleProfileClick}>Profile</button>
            <button className="profile-button" onClick={handleLogout}>Log Out</button>
          </div>
        ) : (
          <div className="profile-details">
            <h3>Profile Information</h3>
            <label>
              Name:
              <input type="text" name="name" value="John Doe" readOnly />
            </label>
            <label>
              Email:
              <input type="email" name="email" value="john.doe@example.com" readOnly />
            </label>
            <button className="backmenu-button" onClick={() => setShowProfileDetails(false)}>
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
