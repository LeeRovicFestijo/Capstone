import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import { Link, useLocation } from 'react-router-dom';
import { usePOS } from '../api/POSProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faReceipt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './pos-style.css';

function SidebarPOS({children}) {

    const location = useLocation();
    // const [userName, setUserName] = useState('');
    const { user } = usePOS();
    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        if (user) {
        }
    }, [user]); 


  return (
    <MainLayout>
        <div className="row" style={{ height: '91vh' }}>
            <div className="col-lg-1 p-3 d-flex flex-column border bordery-gray rounded-left">
                <nav className="nav flex-column">
                    <Link to="/pos" className={`nav-link-side ${isActive('/pos') ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faHome} /> Home
                    </Link>
                    <Link to="/customers" className={`nav-link-side ${isActive('/customers') ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faUsers} /> Customers
                    </Link>
                    <Link to="/transactions" className={`nav-link-side ${isActive('/transactions') ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faReceipt} /> Transactions
                    </Link>
                </nav>
                <div className="mt-auto d-flex flex-column align-items-center">
                    {user && <p className='user-name'>{user.username}</p>}
                    <i className="bi bi-person-circle" style={{ fontSize: '50px', color: 'gray' }}></i>
                    <Link to="/" className="nav-link-logout logout">
                        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </Link>
                </div>
            </div>
            <div className="col-lg-11">
                {children}
            </div>
        </div>
    </MainLayout>
  )
}

export default SidebarPOS