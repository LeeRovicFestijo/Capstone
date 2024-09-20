import React, { useState } from "react";
import { Link } from "react-router-dom";

const Search = ({ CartItem }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });
  const [isEditing, setIsEditing] = useState(false);

  window.addEventListener("scroll", function () {
    const search = document.querySelector(".search");
    search.classList.toggle("active", window.scrollY > 100);
  });

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Handle the save functionality (e.g., API call to update user data)
    console.log("User information saved:", userInfo);
  };

  const handleClose = () => {
    setShowProfile(false);
  };

  return (
    <>
      <section className="search">
        <div className="container c_flex">
          <div className="logo width ">
            <span className="left-text">SIG BUILDERS</span>
          </div>

          <div className="search-box f_flex">
            <i className="fa fa-search"></i>
            <input type="text" placeholder="Search and hit enter..." />
          </div>

          <div className="icon f_flex width">
            <i className="fa fa-user icon-circle" onClick={toggleProfile}></i>
            <div className="cart">
              <Link to="/cart">
                <i className="fa fa-shopping-bag icon-circle"></i>
                <span>{CartItem.length === 0 ? "" : CartItem.length}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showProfile && (
        <div className="profile-popup">
          <div className="profile-content">
            <button className="close-button" onClick={handleClose}>
              &times;
            </button>
            <h3>Profile Information</h3>
            <label>
              Name:
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleChange}
                />
              ) : (
                <span>{userInfo.name}</span>
              )}
            </label>
            <label>
              Email:
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleChange}
                />
              ) : (
                <span>{userInfo.email}</span>
              )}
            </label>

            <div className="profile-actions">
              {isEditing ? (
                <button onClick={handleSave}>Save</button>
              ) : (
                <button onClick={handleEdit}>Edit</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Search;
