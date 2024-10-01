import React, { useEffect, useState } from "react"; // Import useState
import { Link } from "react-router-dom"; // Removed useHistory as it's not used anymore
import "./Header.css";
import Profile from "../profile/Profile"; // Import Profile component

const Search = ({ CartItem }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State for opening/closing profile sidebar

  useEffect(() => {
    const handleScroll = () => {
      const search = document.querySelector(".search");
      search.classList.toggle("active", window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          {/* Profile icon that opens the profile sidebar */}
          <i
            className="fa fa-user icon-circle"
            onClick={() => setIsProfileOpen(true)}
            role="button"
            aria-label="Open Profile"
            style={{ cursor: "pointer" }} // Optional: to indicate it's clickable
          ></i>
          <div className="cart">
            <Link to="/cart">
              <i className="fa fa-shopping-bag icon-circle"></i>
              <span>{CartItem.length === 0 ? "" : CartItem.length}</span>
            </Link>
          </div>
        </div>

        {/* Render Profile sidebar if it's open */}
        {isProfileOpen && (
          <Profile closeProfile={() => setIsProfileOpen(false)} />
        )}
      </section>
    </>
  );
};

export default Search;
