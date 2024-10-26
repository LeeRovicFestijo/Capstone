import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast, Flip } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown } from 'react-bootstrap';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import "../components/header-style.css";
import "../components/main-layout.css";
import { useInventory } from '../api/InventoryProvider';
import Sidebar from '../Sidebar';

function MainLayout({children}) {
    const { persistedAdmin, setPersistedAdmin  } = useInventory();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [openProfileDetailsModal, setOpenProfileDetailsModal] = useState(false);
    const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
    const navigate = useNavigate();

    const [adminDetails, setAdminDetails] = useState({
        account_username: persistedAdmin?.account_username || '',
        account_email: persistedAdmin?.account_email || '',
        account_profile: persistedAdmin?.account_profile || null,
        account_preview_profile: null,
      });
  

    const [adminPassword, setAdminPassword] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

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
    };

    useEffect(() => {
        if (!persistedAdmin) {
            navigate('/');
        }
    }, [persistedAdmin, navigate]);

    const fetchAdmin = async () => {
        const account_id = persistedAdmin?.account_id;
        try {
            const response = await axios.get(`https://adminserver.sigbuilders.app/api/admin_profile?account_id=${account_id}`);
            if (response.status === 200) {
                setPersistedAdmin(response.data);
                return response.data;
            }
        } catch (error) {
            console.error('Error fetching admin:', error);
        }
    };

    useEffect(() => {
        fetchAdmin();
    }, []);

    const handleOpenProfileModal = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleOpenPasswordModal = () => {
        setAdminPassword({
            old_password: '',
            new_password: '',
            confirm_password: '',
        });
        setOpenChangePasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setOpenChangePasswordModal(false);
    };

    const handleOpenProfileDetailsModal = () => {
        setAdminDetails({
            account_username: persistedAdmin.account_username,
            account_email: persistedAdmin.account_email,
            account_profile: persistedAdmin.account_profile,
            account_preview_profile: null,
        });
        setOpenProfileDetailsModal(true);
    };

    const handleCloseProfileDetailsModal = () => {
        setOpenProfileDetailsModal(false);
    };

    const handleInputPasswordChange = (e) => {
        const { name, value } = e.target;
        setAdminPassword({ ...adminPassword, [name]: value });
    };

    const handleProfileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file); 
            setAdminDetails((prevDetails) => ({
                ...prevDetails,
                account_profile: file,
                account_profile_preview: imageUrl,
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdminDetails({ ...adminDetails, [name]: value });
    };

    const handleSaveChanges = async () => {
        const { account_username, account_email } = adminDetails;
        const account_id = persistedAdmin.account_id;
        const employee_id = persistedAdmin.employee_id;
        const errors = [];
  
        if (!account_username || !account_email) {
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
  
            if (adminDetails.account_profile) {
                formDataToSend.append('account_profile', adminDetails.account_profile);
            }
  
            const response = await axios.post('https://adminserver.sigbuilders.app/api/update-admin-account', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
  
            if (response.status === 200) {
                toast.success('Account updated successfully!', toastOptions);
                fetchAdmin();
                handleCloseProfileDetailsModal();
            }
        } catch (error) {
            console.error('Error updating account:', error);
        }
    };

    const handleSavePassword = async () => {
        const { old_password, new_password, confirm_password } = adminPassword;
        const account_id = persistedAdmin.account_id;
        const errors = [];
        

        if (!old_password || !new_password || !confirm_password) {
            toast.error("All fields required!", toastOptions);
            return;
        }

        if (new_password !== confirm_password) {
            toast.error("New and confirm password do not match.", toastOptions);
            return;
        }

        if (errors.length > 0) {
            console.error(errors);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('account_id', account_id);
            formDataToSend.append('old_password', old_password);
            formDataToSend.append('new_password', new_password);
            formDataToSend.append('confirm_password', confirm_password);

            const response = await axios.post('https://adminserver.sigbuilders.app/api/change-admin-password', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                toast.success('Password changed successfully!', toastOptions)
                handleClosePasswordModal();
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Display the message from the backend
                toast.error(error.response.data.message, toastOptions);
            } else {
                console.error('Error changing password:', error);
                toast.error('An error occurred while changing the password.', toastOptions);
            }
        }
    };


    const handleLogoutClick = () => {
        setPersistedAdmin(null);
        navigate('/');
    } 

  return (
   <div className='layout'>
        <header>
            <div className='web-header'>
                <div className='row'>
                    <div className="header-container d-flex justify-content-between align-items-center">
                        <div className="logo">
                            <p className="icon-text">SIG BUILDERS</p>
                            <p className="sub-icon-text">and Construction Supply Inc.</p>
                        </div>

                        <Dropdown className='custom-dropdown'>
                            <Dropdown.Toggle variant="light" className="profile-dropdown d-flex align-items-center" id="dropdown-basic">
                                {persistedAdmin?.account_profile ? (
                                    <img src={persistedAdmin.account_profile} alt="user avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                ) : (
                                    <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '2rem', color: '#aaa' }} />
                                )}
                                <span className="ms-2">{persistedAdmin?.account_username}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className='custom-dropdown-menu'>
                                <Dropdown.Item onClick={handleOpenProfileModal}>Profile</Dropdown.Item>
                                <Dropdown.Item onClick={handleOpenProfileDetailsModal}>Change Profile</Dropdown.Item>
                                <Dropdown.Item onClick={handleOpenPasswordModal}>Change Password</Dropdown.Item>
                                <Dropdown.Item onClick={handleLogoutClick}>Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dialog open={showProfileModal} onClose={handleCloseProfileModal}>
                            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>User Profile</DialogTitle>
                            <DialogContent>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                    {persistedAdmin?.account_profile ? (
                                        <img src={persistedAdmin.account_profile} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} className='mt-2 mb-1'/>
                                    ) : (
                                        <i className="bi bi-person-circle" style={{ fontSize: '100px', color: 'gray' }} />
                                    )}
                                    <p><strong>Username:</strong></p>
                                    <p>{persistedAdmin?.account_username}</p>
                                    <p><strong>Email:</strong></p>
                                    <p>{persistedAdmin?.account_email}</p>
                                    <p><strong>Role:</strong></p>
                                    <p>{persistedAdmin?.account_role}</p>
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseProfileModal} color="primary">
                                Close
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={openProfileDetailsModal} onClose={handleCloseProfileDetailsModal}>
                          <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>Change Account Details</DialogTitle>
                          <DialogContent>
                              <div style={{ textAlign: 'center' }}>
                              {adminDetails.account_profile ? (
                                  <img src={adminDetails.account_profile_preview ? adminDetails.account_profile_preview : adminDetails.account_profile} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                              ) : (
                                  <i className="bi bi-person-circle" style={{ fontSize: '100px', color: 'gray' }} />
                              )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: '10px' }}>
                                  <label style={{ cursor: 'pointer' }}>
                                      <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={handleProfileChange} 
                                          style={{ display: 'none' }}
                                      />
                                      <span style={{
                                          display: 'inline-block', 
                                          backgroundColor: '#1B305B', 
                                          color: 'white', 
                                          padding: '8px 15px', 
                                          borderRadius: '5px', 
                                          cursor: 'pointer'
                                      }}>
                                          Upload Profile Picture
                                      </span>
                                  </label>
                              </div>
                              <TextField
                              margin="dense"
                              label="Name"
                              type="text"
                              fullWidth
                              name="account_username"
                              value={adminDetails.account_username}
                              onChange={handleInputChange}
                              />
                              <TextField
                              margin="dense"
                              label="Email"
                              type="email"
                              fullWidth
                              name="account_email"
                              value={adminDetails.account_email}
                              onChange={handleInputChange}
                              />
                          </DialogContent>
                          <DialogActions>
                              <Button onClick={handleCloseProfileDetailsModal} color="primary">
                                Cancel
                              </Button>
                              <Button onClick={handleSaveChanges} color="primary">
                                Save
                              </Button>
                          </DialogActions>
                        </Dialog>

                        <Dialog open={openChangePasswordModal} onClose={handleClosePasswordModal}>
                            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>Change Password</DialogTitle>
                            <DialogContent>
                                <div style={{ textAlign: 'center' }}>
                                {persistedAdmin?.account_profile ? (
                                    <img src={persistedAdmin.account_profile} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                                ) : (
                                    <i className="bi bi-person-circle" style={{ fontSize: '100px', color: 'gray' }} />
                                )}
                                </div>
                                <TextField
                                margin="dense"
                                label="Old Password"
                                type="text"
                                fullWidth
                                name="old_password"
                                value={adminPassword.old_password}
                                onChange={handleInputPasswordChange}
                                />
                                <TextField
                                margin="dense"
                                label="New Password"
                                type="password"
                                fullWidth
                                name="new_password"
                                value={adminPassword.new_password}
                                onChange={handleInputPasswordChange}
                                />
                                <TextField
                                margin="dense"
                                label="Confirm Password"
                                type="password"
                                fullWidth
                                name="confirm_password"
                                value={adminPassword.confirm_password}
                                onChange={handleInputPasswordChange}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClosePasswordModal} color="primary">
                                Cancel
                                </Button>
                                <Button onClick={handleSavePassword} color="primary">
                                Save
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </div>
            </div>
        </header>

        <div className="layout-container-header">
            <aside className="sidebar">
                <Sidebar />
            </aside>
            
            <main className="layout-content">
                {children}
            </main>
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
        </div>
   </div>
  )
}

export default MainLayout