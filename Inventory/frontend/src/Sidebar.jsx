import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaChartLine, FaUserCircle, FaTruck, FaSignOutAlt } from 'react-icons/fa';
import { ToastContainer, Flip } from 'react-toastify';

const Sidebar = () => {
    return (
        <div className="sidebar col-lg-2">
            <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Flip}
            />
            <h2>SIG BUILDERS</h2>
            <ul>
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
