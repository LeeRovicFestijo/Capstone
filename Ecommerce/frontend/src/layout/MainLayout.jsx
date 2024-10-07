import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; 
import { Autocomplete, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { ToastContainer, toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEcommerce } from "../Api/EcommerceApi";
import "../style/header-style.css";
import "../style/footer-style.css";


function MainLayout({children}) {

  const { cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer, selectedCustomerLocal, setIsCustomerAdded, persistedUser, payment, customerName, setCustomerName, placeholderImage } = useEcommerce();
  const [MobileMenu, setMobileMenu] = useState(false);
  const [searchItems, setSearchItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearchItems = async () => {
    setIsLoading(true);
    try {
    const result = await axios.get('http://localhost:5001/api/search-items'); 
    setSearchItems(result.data);
    } catch (error) {
    console.error('Error fetching products:', error);
    } finally {
    setIsLoading(false);
    }
  };

  useEffect(() => {
      fetchSearchItems();
    }, []);

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
                    <Link to="/main" aria-label="Shopping Cart">
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
                    <i
                        className="fa fa-user icon-circle"
                        role="button"
                        aria-label="Open Profile"
                        style={{ cursor: "pointer" }} 
                    />
                    <div className="cart">
                        <Link to="/cart" aria-label="Shopping Cart">
                            <i className="fa fa-shopping-bag icon-circle"></i>
                        </Link>
                    </div>
                    <i
                        className="fa-solid fa-gear icon-circle"
                        role="button"
                        aria-label="Open Profile"
                        style={{ cursor: "pointer" }} 
                    />
                  </div>
              </section>
            </div>
          </div>
          <div className='container'>
              {children}
          </div>
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
                    <li>Poblacion 1, Sta. Teresita, Batangas</li>
                    <li>Email: uilib.help@gmail.com</li>
                    <li>Phone: +1 1123 456 780</li>
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