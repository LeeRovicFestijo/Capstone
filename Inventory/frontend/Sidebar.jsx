import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>SIG BUILDERS</h2>
            <ul>
                <li><a href="#">Point Of Sale</a></li>
                <li><a href="#">Dashboard</a></li>
                <li><a href="#" className="active">Inventory</a></li>
                <li><a href="#">Reports</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;
