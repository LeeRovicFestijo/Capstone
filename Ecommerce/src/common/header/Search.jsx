import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Search = ({ CartItem }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const search = document.querySelector(".search");
      search.classList.toggle("active", window.scrollY > 100);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleProfile = () => setShowProfile((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setIsEditing(true);
  
  const handleSave = () => {
    setIsEditing(false);
    console.log("User information saved:", userInfo);
  };

  const handleClose = () => setShowProfile(false);

  return (
    <>
<section className="search">
  <div className="search-box f_flex">
    <i className="fa fa-search"></i>
    <input type="text" placeholder="Search and hit enter..." />
  </div>

  <div className="logo width">
    <span className="left-text">SIG BUILDERS</span>
  </div>

  <div className="icon-container">
    <i className="fa fa-user icon-circle" onClick={toggleProfile}></i>
    <div className="cart">
      <Link to="/cart">
        <i className="fa fa-shopping-bag icon-circle"></i>
        <span>{CartItem.length === 0 ? "" : CartItem.length}</span>
      </Link>
    </div>
  </div>
</section>



      {showProfile && (
        <div className="profile-popup" aria-modal="true" role="dialog">
          <div className="profile-content">
            <button className="close-button" onClick={handleClose} aria-label="Close profile">
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
                <button type="button" onClick={handleSave}>Save</button>
              ) : (
                <button type="button" onClick={handleEdit}>Edit</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Search;
