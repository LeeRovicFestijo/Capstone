import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [MobileMenu, setMobileMenu] = useState(false);
  return (
    <>
      <header className='header'>
        <div className='nav-container'>
          <ul className={MobileMenu ? "nav-links-MobileMenu" : "nav-links"} onClick={() => setMobileMenu(false)}>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/pages'>About Us</Link>
            </li>
            <li>
              <Link to='/track'>Track my order</Link>
            </li>
            <li>
              <Link to='/contact'>Contact</Link>
            </li>
          </ul>

          <button className='toggle' onClick={() => setMobileMenu(!MobileMenu)}>
            {MobileMenu ? <i className='fas fa-times close'></i> : <i className='fas fa-bars open'></i>}
          </button>
        </div>
      </header>
    </>
  );
}

export default Navbar;
