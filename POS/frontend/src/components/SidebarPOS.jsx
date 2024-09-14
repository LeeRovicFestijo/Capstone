import React from 'react'
import MainLayout from '../layout/MainLayout'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faReceipt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './style.css';

function SidebarPOS({children}) {
  return (
    <MainLayout>
        <div className="row">
            <div className="col-lg-2 p-3 d-flex flex-column border bordery-gray rounded-left">
                <nav className="nav flex-column">
                    <Link to="/pos" className="nav-link">
                        <FontAwesomeIcon icon={faHome} /> Home
                    </Link>
                    <Link to="/" className="nav-link">
                        <FontAwesomeIcon icon={faUsers} /> Customers
                    </Link>
                    <Link to="/" className="nav-link">
                        <FontAwesomeIcon icon={faReceipt} /> Transactions
                    </Link>
                </nav>
                <div className="mt-auto d-flex flex-column align-items-center">
                    <img
                        src="https://via.placeholder.com/80"
                        alt="Profile"
                        className="img-fluid rounded-circle mb-2"
                        style={{ width: '80px', height: '80px' }}
                    />
                    <button className="btn btn-link text-danger" onClick={() => console.log('Logout')}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </button>
                </div>
            </div>
            <div className="col-lg-10">
                {children}
            </div>
        </div>
    </MainLayout>
  )
}

export default SidebarPOS