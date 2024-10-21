import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import { Autocomplete, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Menu, MenuItem } from '@mui/material';
import { Box } from '@mui/system';
import { ToastContainer, toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEcommerce } from "../Api/EcommerceApi";
import "../style/main-layout-style.css";
import "../style/header-style.css";
import "../style/footer-style.css";


function MainLayout({children}) {

    const { cart, setCart, persistedCustomer, setPersistedCustomer } = useEcommerce();
    const [searchItems, setSearchItems] = useState([]);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openProfileDetailsModal, setOpenProfileDetailsModal] = useState(false);
    const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const [customerDetails, setCustomerDetails] = useState({
        customer_name: persistedCustomer?.customer_name || '',
        customer_email: persistedCustomer?.customer_email || '',
        customer_address: persistedCustomer?.customer_address || '',
        customer_number: persistedCustomer?.customer_number || '',
        customer_profile: persistedCustomer?.customer_profile || null,
        customer_preview_profile: null,
    });
    const [customerPassword, setCustomerPassword] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    const fetchSearchItems = async () => {
        try {
        const result = await axios.get('http://localhost:5001/api/search-items'); 
        setSearchItems(result.data);
        } catch (error) {
        console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
      fetchSearchItems();
    }, []);

    const fetchCustomer = async () => {
        const customer_id = persistedCustomer?.customer_id;
        try {
            const response = await axios.get(`http://localhost:5001/api/customer_profile?customer_id=${customer_id}`);
            if (response.status === 200) {
                setPersistedCustomer(response.data);
                return response.data;
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, []);

    useEffect(() => {
        if (persistedCustomer) {
            setCustomerDetails({
                customer_name: persistedCustomer.customer_name,
                customer_email: persistedCustomer.customer_email,
                customer_address: persistedCustomer.customer_address,
                customer_number: persistedCustomer.customer_number,
                customer_profile: persistedCustomer.customer_profile,
            });
        }
    }, [persistedCustomer]);

    const addProduct = async (product) => {
        let findProductInCart = cart.find(i => i.item_id === product.item_id);

        if (findProductInCart) {
            const newCart = cart.map(cartItem => {
                if (cartItem.item_id === product.item_id) {
                    return {
                        ...cartItem,
                        quantity: cartItem.quantity + 1,
                        totalAmount: cartItem.unit_price * (cartItem.quantity + 1),
                    };
                }
                return cartItem;
            });
            setCart(newCart);
        } else {
            const addingProduct = {
                ...product,
                quantity: 1,
                totalAmount: parseFloat(product.unit_price),
            };
            console.log(addingProduct);
            setCart([...cart, addingProduct]);
            toast.success(`Added ${product.item_description} to cart`, toastOptions);
        }
        console.log(cart);
    };

    const handleOpenProfileModal = () => {
        setOpenProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setOpenProfileModal(false);
    };

    const handleOpenProfileDetailsModal = () => {
        setCustomerDetails({
            customer_name: persistedCustomer.customer_name,
            customer_email: persistedCustomer.customer_email,
            customer_address: persistedCustomer.customer_address,
            customer_number: persistedCustomer.customer_number,
            customer_profile: persistedCustomer.customer_profile,
            customer_preview_profile: null,
        });
        setOpenProfileDetailsModal(true);
    };

    const handleCloseProfileDetailsModal = () => {
        setOpenProfileDetailsModal(false);
    };

    const handleOpenPasswordModal = () => {
        setCustomerPassword({
            old_password: '',
            new_password: '',
            confirm_password: '',
        });
        setOpenChangePasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setOpenChangePasswordModal(false);
    };

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        setPersistedCustomer(null);
        setAnchorEl(null);
    };

    const handleSignIn = () => {
        setAnchorEl(null);
        navigate('/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails({ ...customerDetails, [name]: value });
    };

    const handleInputPasswordChange = (e) => {
        const { name, value } = e.target;
        setCustomerPassword({ ...customerPassword, [name]: value });
    };

    const handleProfileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file); 
            setCustomerDetails((prevDetails) => ({
                ...prevDetails,
                customer_profile: file,
                customer_preview_profile: imageUrl,
            }));
        }
    };

    const handleSaveChanges = async () => {
        const { customer_name, customer_email, customer_address, customer_number } = customerDetails;
        const customer_id = persistedCustomer.customer_id;
        const errors = [];
        console.log(customer_id);

        if (!customer_name || !customer_email || !customer_address || !customer_number) {
            errors.push("All fields are required.");
        }

        if (errors.length > 0) {
            // Handle errors (you can show these errors in the UI if needed)
            console.error(errors);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('customer_id', customer_id);
            formDataToSend.append('customer_name', customer_name);
            formDataToSend.append('customer_email', customer_email);
            formDataToSend.append('customer_address', customer_address);
            formDataToSend.append('customer_number', customer_number);

            if (customerDetails.customer_profile) {
                formDataToSend.append('customer_profile', customerDetails.customer_profile);
            }

            const response = await axios.post('http://localhost:5001/api/update-customer-account', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                toast.success('Account updated successfully!', toastOptions);
                handleCloseProfileDetailsModal();
                handleCloseMenu();
            }

            if (response.status === 401) {
                toast.error('Old password is incorrect.', toastOptions);
            }
        } catch (error) {
            console.error('Error updating account:', error);
        }
    };

    const handleSavePassword = async () => {
        const { old_password, new_password, confirm_password } = customerPassword;
        const customer_id = persistedCustomer.customer_id;
        const errors = [];

        if (!old_password || !new_password || !confirm_password) {
            toast.error("All fields required!", toastOptions);
        }

        if (new_password !== confirm_password) {
            toast.error("New and confirm password do not match.", toastOptions);
        }

        if (errors.length > 0) {
            console.error(errors);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('customer_id', customer_id);
            formDataToSend.append('old_password', old_password);
            formDataToSend.append('new_password', new_password);
            formDataToSend.append('confirm_password', confirm_password);

            const response = await axios.post('http://localhost:5001/api/change-admin-password', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                toast.success('Password changed successfully!', toastOptions)
                handleClosePasswordModal();
                handleCloseMenu();
            }
        } catch (error) {
            console.error('Error changing password:', error);
        }
    };

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

  return (
    <div>
        <main>
          <div className='web-header'>
            <div className="container">
              <section className="header-container">
                <div className="logo">
                    <Link to="/" aria-label="Shopping Cart">
                        <p className="icon-text">SIG BUILDERS</p>
                        <p className="sub-icon-text">and Construction Supply Inc.</p>
                    </Link>
                </div>

                <div className="search-box">
                    <Autocomplete
                        className="autocomplete"
                        disablePortal
                        getOptionLabel={(searchItems) => `${searchItems.item_description}`}
                        options={searchItems}
                        isOptionEqualToValue={(option, value) => 
                            option.item_description === value.item_description
                        }
                        noOptionsText={'Product not available'}
                        renderOption={(props, searchItems) => (
                            <Box component='li' {...props} key={searchItems.item_id}>
                                {searchItems.item_description}
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label='Search for a product...' 
                                variant="outlined" 
                            />
                        )}
                        onChange={(event, value) => {
                          if (value) {
                            addProduct(value);
                          }
                        }}
                        sx={{
                            width: '100%', 
                            backgroundColor: 'white',
                            '& .MuiAutocomplete-inputRoot': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white', 
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                              },
                            },
                            '& .MuiAutocomplete-option': {
                              color: 'black',
                              backgroundColor: 'lightgray', 
                              '&[aria-selected="true"]': {
                                backgroundColor: 'lightblue', 
                              },
                            },
                            '& .MuiAutocomplete-popupIndicator': {
                                display: 'none',
                            },
                        }}
                    />
                </div>

                <div className="icon-container">
                    {persistedCustomer === '' || persistedCustomer === null ?
                        <i
                            className="fa fa-user icon-circle"
                            role="button"
                            aria-label="Open Profile"
                            style={{ cursor: "not-allowed" }}
                        />
                    :   
                        <i
                            className="fa fa-user icon-circle"
                            role="button"
                            aria-label="Open Profile"
                            style={{ cursor: "pointer" }}
                            onClick={handleOpenProfileModal}
                        />
                    } 
                    <div className="cart">
                        <Link to="/cart" aria-label="Shopping Cart">
                            <i className="fa fa-shopping-bag icon-circle"></i>
                        </Link>
                    </div>
                    <div className="order-history">
                        <Link to="/order-history" aria-label="History">
                            <i className="fa fa-history icon-circle"></i>
                        </Link>
                    </div>
                    <i
                        className="fa-solid fa-gear icon-circle"
                        role="button"
                        aria-label="Open Profile"
                        style={{ cursor: "pointer" }} 
                        onClick={handleOpenMenu} 
                    />
                  </div>
              </section>
            </div>
          </div>
          <div className='container'>
              {children}
          </div>
            <Dialog open={openProfileModal} onClose={handleCloseProfileModal}>
                <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>User Profile</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        {persistedCustomer?.customer_profile ? (
                            <img src={persistedCustomer.customer_profile} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} className='mt-2 mb-1'/>
                        ) : (
                            <i className="bi bi-person-circle" style={{ fontSize: '100px', color: 'gray' }} />
                        )}
                        <p><strong>Name:</strong></p>
                        <p>{persistedCustomer?.customer_name}</p>
                        <p><strong>Email:</strong></p>
                        <p>{persistedCustomer?.customer_email}</p>
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
                {customerDetails.customer_profile ? (
                    <img src={customerDetails.customer_preview_profile ? customerDetails.customer_preview_profile : customerDetails.customer_profile} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
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
                name="customer_name"
                value={customerDetails.customer_name}
                onChange={handleInputChange}
                />
                <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                name="customer_email"
                value={customerDetails.customer_email}
                onChange={handleInputChange}
                />
                <TextField
                margin="dense"
                label="Address"
                type="text"
                fullWidth
                name="customer_address"
                value={customerDetails.customer_address}
                onChange={handleInputChange}
                />
                <TextField
                margin="dense"
                label="Number"
                type="text"
                fullWidth
                name="customer_number"
                value={customerDetails.customer_number}
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
                {customerDetails.customer_profile ? (
                    <img src={customerDetails.customer_profile} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
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
                value={customerPassword.old_password}
                onChange={handleInputPasswordChange}
                />
                <TextField
                margin="dense"
                label="New Password"
                type="password"
                fullWidth
                name="new_password"
                value={customerPassword.new_password}
                onChange={handleInputPasswordChange}
                />
                <TextField
                margin="dense"
                label="Confirm Password"
                type="password"
                fullWidth
                name="confirm_password"
                value={customerPassword.confirm_password}
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
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                className="mt-2"
            >
               {persistedCustomer ? [
                    <MenuItem key="change-details" onClick={handleOpenProfileDetailsModal}>Change Account Details</MenuItem>,
                    <MenuItem key="change-password" onClick={handleOpenPasswordModal}>Change Password</MenuItem>,
                    <MenuItem key="logout" onClick={handleLogout}>Logout</MenuItem>
                ] : (
                    <MenuItem key="sign-in" onClick={handleSignIn}>Sign In</MenuItem>
                )}
            </Menu>
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
          <footer>
            <div className="container">
                <div className="box">
                <h1>Contact Us</h1>
                <ul>
                    <li>Location: Poblacion 1, Sta. Teresita, Batangas</li>
                    <li>Email: simcetxen@yahoo.com</li>
                    <li>Phone: 09192161595 / 09175942377</li>
                </ul>
                </div>

                <div className="box">
                <h2>About Us</h2>
                <ul>
                    <li>Careers</li>
                    <li>Our Stores</li>
                    <li>Terms & Conditions</li>
                    <li>Privacy Policy</li>
                </ul>
                </div>

                <div className="box">
                <h2>Customer Care</h2> 
                <ul>
                    <li>Help Center</li>
                    <li>How to Buy</li>
                    <li>Track Your Order</li>
                    <li>Corporate & Bulk Purchasing</li>
                    <li>Returns & Refunds</li>
                </ul>
                </div>

                <div className="box">
                <h2>SIG BUILDERS</h2> 
                <p>"SIG BUILDER is your one-stop shop for all construction supplies, offering high-quality materials and tools to bring your building projects to life."</p>
                </div>
            </div>
        </footer>
        </main>
    </div>
  )
}

export default MainLayout