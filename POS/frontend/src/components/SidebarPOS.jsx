import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePOS } from '../api/POSProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faReceipt, faBars } from '@fortawesome/free-solid-svg-icons';
import './pos-style.css';
import './sidebar-style.css';

function SidebarPOS() {
    const location = useLocation();
    const navigate = useNavigate();
    const { persistedUser } = usePOS();
    const isActive = (path) => location.pathname === path;
    const navRef = useRef();

    const showNavbar = () => {
		navRef.current.classList.toggle(
			"responsive_nav"
		);
	};

    useEffect(() => {
        if (!persistedUser) {
            navigate('/');
        }
    }, [persistedUser, navigate]);

    return (
        <div className="layout-container">
            <div className={`d-flex flex-column sidebar-content`}>
                <div className='container'>
                    <nav ref={navRef}>
                        <Link to="/pos" className={`nav-link-side ${isActive('/pos') ? 'active' : ''}`}>
                            <FontAwesomeIcon icon={faHome} /> Home
                        </Link>
                        <Link to="/customers" className={`nav-link-side ${isActive('/customers') ? 'active' : ''}`}>
                            <FontAwesomeIcon icon={faUsers} /> Customers
                        </Link>
                        <Link to="/transactions" className={`nav-link-side ${isActive('/transactions') ? 'active' : ''}`}>
                            <FontAwesomeIcon icon={faReceipt} /> Transactions
                        </Link>
                        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                    </nav>
                    <button className="nav-btn btn-visible" onClick={showNavbar}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SidebarPOS;
