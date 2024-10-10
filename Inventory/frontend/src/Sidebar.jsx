import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaChartLine, FaUserCircle, FaTruck, FaSignOutAlt } from 'react-icons/fa';
import MainLayout from './layout/MainLayout';

const Sidebar = () => {
    return (
    <div className="layout-container">
        <div className="sidebar-content">
            <div className='link-container'>
                <ul>
                    <li><Link to="/dashboard"><FaTachometerAlt className="icon" /> Dashboard</Link></li>
                    <li><Link to="/inventory" className="active"><FaBoxes className="icon" /> Inventory</Link></li>
                    <li><Link to="/reports"><FaChartLine className="icon" /> Reports</Link></li>
                    <li><Link to="/shipment"><FaTruck className="icon" /> Shipment</Link></li>
                    <li><Link to="/accounts"><FaUserCircle className="icon" /> Accounts</Link></li>
                </ul>
            </div>
        </div>
    </div>
    );
};

export default Sidebar;