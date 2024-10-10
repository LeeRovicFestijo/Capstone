import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from "axios";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { usePOS } from '../api/POSProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faReceipt, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { toast, Flip } from 'react-toastify';
import './pos-style.css';
import './sidebar-style.css';

function SidebarPOS() {
    const location = useLocation();
    const navigate = useNavigate();
    const { persistedUser, setPersistedUser, logout } = usePOS();
    const isActive = (path) => location.pathname === path;
    const [showModal, setShowModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        account_id: persistedUser?.account_id || '',
        employee_id: persistedUser?.employee_id || '',
        account_username: persistedUser?.account_username || '',
        account_email: persistedUser?.account_email || '',
        account_password: persistedUser?.account_password || '',
        account_profile: persistedUser?.account_profile || null
    });
    const [menuOpen, setMenuOpen] = useState(false);

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Flip,
    }

    const fetchUser = async () => {
        const account_id = formData.account_id;
        try {
            const response = await axios.get(`http://localhost:5001/api/user_profile?account_id=${account_id}`);
            if (response.status === 200) {
                setPersistedUser(response.data);
                return response.data;
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (persistedUser) {
            setFormData({
                account_id: persistedUser.account_id,
                employee_id: persistedUser.employee_id,
                account_username: persistedUser.account_username,
                account_email: persistedUser.account_email,
                account_password: persistedUser.account_password,
                account_profile: persistedUser.account_profile,
            });
        }
    }, [persistedUser]);

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPreviewImage(null);
    };

    const handleFilePreview = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            handleFileChange(e);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, account_profile: e.target.files[0] });
    };

    const handleSubmit = async () => {
        const { account_id, employee_id, account_username, account_email, account_password } = formData;
        const errors = [];

        if (!account_username || !account_email || !account_password) {
            errors.push("All fields are required.");
        }

        if (errors.length > 0) {
            console.error(errors);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('account_id', account_id);
            formDataToSend.append('employee_id', employee_id);
            formDataToSend.append('account_username', account_username);
            formDataToSend.append('account_email', account_email);
            formDataToSend.append('account_password', account_password);

            if (formData.account_profile) {
                formDataToSend.append('account_profile', formData.account_profile);
            }

            const response = await axios.post('http://localhost:5001/api/update-account', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                toast.success('Account updated successfully!', toastOptions);
                handleCloseModal(); 
            }
        } catch (error) {
            console.error('Error updating account:', error);
        }
    };

    useEffect(() => {
        if (!persistedUser) {
            navigate('/');
        }
    }, [persistedUser, navigate]);

    // Toggle menu open/close
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        setShowLogoutModal(true); // Show logout confirmation modal
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false); // Close logout confirmation modal
    };

    return (
        <div className="layout-container">
            <div className={`d-flex flex-column sidebar-content ${menuOpen || window.innerWidth > 992 ? 'open' : 'closed'}`}>
                <div className='container'>
                    <button className="btn btn-link d-lg-none" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <nav className={`nav flex-column ${menuOpen || window.innerWidth > 992 ? 'show' : 'collapse'}`}>
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
                </div>
            </div>
        </div>
    );
}

export default SidebarPOS;
