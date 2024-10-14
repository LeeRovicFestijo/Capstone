import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaChartLine, FaUserCircle, FaTruck, FaBars } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const navRef = useRef();

    const showNavbar = () => {
		navRef.current.classList.toggle("responsive_nav");
	};

    return (
        <div className="layout-container">
            <div className="sidebar-content">
                <div className='link-container'>
                    <nav ref={navRef}>
                        <ul>
                            <li>
                                <NavLink to="/dashboard" activeClassName="active">
                                    <FaTachometerAlt className="icon" /> Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/inventory" activeClassName="active">
                                    <FaBoxes className="icon" /> Inventory
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/reports" activeClassName="active">
                                    <FaChartLine className="icon" /> Reports
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/shipment" activeClassName="active">
                                    <FaTruck className="icon" /> Delivery
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/accounts" activeClassName="active">
                                    <FaUserCircle className="icon" /> Accounts
                                </NavLink>
                            </li>
                            <button className="nav-btn nav-close-btn" onClick={showNavbar}>
                                <FaBars className='icon' />
                            </button>
                        </ul>
                    </nav>
                    <button className="nav-btn btn-visible" onClick={showNavbar}>
                        <FaBars className='icon' />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
