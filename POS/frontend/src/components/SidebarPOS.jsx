import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from "axios";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { usePOS } from '../api/POSProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faReceipt, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import './pos-style.css';

function SidebarPOS({children}) {
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
    const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu

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
        console.log(formData);
        const { account_id, employee_id, account_username, account_email, account_password } = formData;
        const errors = [];

        if (!account_username || !account_email || !account_password) {
            errors.push("All fields are required.");
        }

        if (errors.length > 0) {
            // Handle errors (you can show these errors in the UI if needed)
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

                handleCloseModal(); // Close the modal after success
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
        <MainLayout>
            <div className="row" style={{ height: '97vh', margin: 0 }}>
                <div className={`col-lg-1 p-3 d-flex flex-column border bordery-gray rounded-left sidebar ${menuOpen || window.innerWidth > 992 ? 'open' : 'closed'}`}>
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
                        <Link to="/shipment" className={`nav-link-side ${isActive('/shipment') ? 'active' : ''}`}>
                            <FontAwesomeIcon icon={faReceipt} /> Shipment
                        </Link>
                    </nav>
                    <div className="mt-auto d-flex flex-column align-items-center">
                        <div className='d-flex flex-column align-items-center' onClick={handleShowModal} style={{ cursor: 'pointer' }}>
                            {persistedUser && <p className='user-name'>{persistedUser.account_username}</p>}
                            {persistedUser.account_profile ? (
                                <img src={persistedUser.account_profile} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} className='mt-2 mb-1'/>
                            ) : (
                                <i className="bi bi-person-circle" style={{ fontSize: '50px', color: 'gray' }} />
                            )}
                        </div>
                        <Link to="#" className="nav-link-logout logout" onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                        </Link>
                    </div>
                </div>
                <div className="col-lg-11">
                    {children}
                </div>
            </div>
            <Modal show={showModal} onHide={handleCloseModal} centered className='custom-user-modal'>
                <Modal.Header closeButton>
                    <Modal.Title className="text-center w-100">Account Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit} className="p-3">
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="account_username"
                                        value={formData.account_username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="account_email"
                                        value={formData.account_email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="account_password"
                                        value={formData.account_password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Profile Picture</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFilePreview}
                                    />
                                    {previewImage && (
                                        <img src={previewImage} alt="Preview" className="mt-2" style={{ width: '30%', height: 'auto', display: 'block', margin: '0 auto' }} />
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-center">
                            <Button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>Close</Button>
                            <Button type="submit" className="btn btn-primary">Save Changes</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered size="sm" className='custom-modal'>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{maxHeight: '200px'}}>
                    <h5>Are you sure you want to log out?</h5>
                    <p>Changes may not be saved.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmLogout}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </MainLayout>
    );
}

export default SidebarPOS;
