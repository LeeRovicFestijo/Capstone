import React from 'react';
import './Sidebar.css';
import { FaCashRegister, FaTachometerAlt, FaBoxes, FaChartLine, FaTools, FaUserCircle, FaTruck, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>SIG BUILDERS</h2>
            <ul>
                <li>
                    <a href="#">
                        <FaCashRegister className="icon" /> Point Of Sale
                    </a>
                </li>
                <li>
                    <a href="#">
                        <FaTachometerAlt className="icon" /> Dashboard
                    </a>
                </li>
                <li>
                    <a href="#" className="active">
                        <FaBoxes className="icon" /> Inventory
                    </a>
                </li>
                <li>
                    <a href="#">
                        <FaChartLine className="icon" /> Reports
                    </a>
                </li>
                <li>
                    <a href="#">
                        <FaTools className="icon" /> Site Management
                    </a>
                </li>
                <li>
                    <a href="#">
                        <FaUserCircle className="icon" /> Accounts
                    </a>
                </li>
                <li>
                    <a href="#">
                        <FaTruck className="icon" /> Shipment
                    </a>
                </li>
            </ul>

            {/* Logout button at the bottom with icon */}
            <div className="logout-button">
                <a href="#">
                    <FaSignOutAlt className="icon" /> Logout
                </a>
            </div>
        </div>
    );
};

export default Sidebar;
