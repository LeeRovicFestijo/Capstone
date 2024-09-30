import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { FaCashRegister, FaTachometerAlt, FaBoxes, FaChartLine, FaTools, FaUserCircle, FaTruck, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>SIG BUILDERS</h2>
            <ul>
                <li>
                    <Link to="/pos">
                        <FaCashRegister className="icon" /> Point Of Sale
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard">
                        <FaTachometerAlt className="icon" /> Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/inventory" className="active">
                        <FaBoxes className="icon" /> Inventory
                    </Link>
                </li>
                <li>
                    <Link to="/reports">
                        <FaChartLine className="icon" /> Reports
                    </Link>
                </li>
                <li>
                    <Link to="/site-management">
                        <FaTools className="icon" /> Site Management
                    </Link>
                </li>
                <li>
                    <Link to="/shipment">
                        <FaTruck className="icon" /> Shipment
                    </Link>
                </li>
                <li>
                    <Link to="/accounts">
                        <FaUserCircle className="icon" /> Accounts
                    </Link>
                </li>
            </ul>

            <div className="logout-button">
                <a href="#">
                    <FaSignOutAlt className="icon" /> Logout
                </a>
            </div>
        </div>
    );
};

export default Sidebar;
