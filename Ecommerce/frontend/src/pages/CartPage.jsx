import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { useEcommerce } from "../Api/EcommerceApi";
import { toast, Flip } from 'react-toastify';
import MainLayout from '../layout/MainLayout'
import "../style/cart-style.css";

function CartPage() {
    const { cart, setCart, persistedCustomer, placeholderImage } = useEcommerce();
    const [showPopup, setShowPopup] = useState(false);
    const [checkoutDetails, setCheckoutDetails] = useState({
      location: "",
      paymentMethod: "",
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); 
  
    const totalPrice = cart.reduce((price, item) => price + item.quantity * item.unit_price, 0);
    const shippingCost = 98;
    const finalPrice = totalPrice + shippingCost; 
  
    const handleBuyClick = () => {
        if (cart.length !== 0) {
            setShowPopup(true);
        } else {
            toast.error('Put something on your cart first!', toastOptions)
        }
    };
  
    const closePopup = () => {
      setShowPopup(false);
      setCheckoutDetails({ location: "", paymentMethod: "" }); 
      setSelectedPaymentMethod(""); 
    };
  
    const handleConfirmPayment = async () => {
        const { paymentMethod, location } = checkoutDetails;
        if (!persistedCustomer) {
            toast.error('Sign in first before buying!', toastOptions)
            return;
        }
        if (!paymentMethod) {
            toast.error('Choose a payment method!', toastOptions)
            return;
        }
        if (!location) {
            toast.error('Enter your delivery location!', toastOptions)
            return;
        }

        const finalPaymentMethod = paymentMethod === 'Cash on Delivery' ? 'Cash' : paymentMethod;
 
        const orderData = {
            customer_id: persistedCustomer.customer_id,
            cart: cart.map(item => ({
                item_id: item.item_id,
                item_description: item.item_description,
                order_quantity: item.quantity,
                unit_price: item.unit_price,
            })),
            total_amount: totalPrice,
            order_delivery: 'yes',
            payment_mode: finalPaymentMethod,
            account_id: 1,
            shipping_address: location
        };

        try {
            const response = await axios.post('http://localhost:5001/api/e-orders', orderData);
            if (response.status === 200) {
                setCart([]); 
                closePopup(); 
            } 
            
        } catch (error) {
            if (error.response) {
                if (error.response.data.items_out_of_stock && error.response.data.items_out_of_stock.length > 0) {
                toast.error(
                    <div>
                        <p>The following items do not have sufficient stock:</p>
                        {error.response.data.items_out_of_stock.map((item, index) => (
                            <p key={index}>
                                <strong>{item.item_description}</strong> (requested: {item.requested_quantity}, available: {item.available_quantity})
                            </p>
                        ))}
                    </div>, 
                    toastOptions
                );
                } else {
                    toast.error('Some items have insufficient stocks.')
                }
            } else {
                alert('Failed to create order. Please try again.');
            }
        }
    };
  
    const handleKeyPress = useCallback((e) => {
      if (e.key === "Escape" && showPopup) {
        closePopup();
      }
    }, [showPopup]);
  
    useEffect(() => {
      window.addEventListener("keydown", handleKeyPress);
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }, [handleKeyPress]);

    const updateQuantity = (productId, newQuantity) => {
        const newCart = cart.map(cartItem => {
            if (cartItem.item_id === productId) {
                return {
                    ...cartItem,
                    quantity: newQuantity,
                    totalAmount: cartItem.unit_price * newQuantity
                }
            }
            return cartItem;
        });
        setCart(newCart);
    }

    const removeProduct = async(product) => {
        const newCart = cart.filter(cartItem => cartItem.item_id !== product.item_id);
        setCart(newCart);
    }

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

  return (
    <MainLayout>
        <section className="cart-items">
            <div>
                <h2 style={{ fontWeight: 'bold' }}>Your Cart</h2>
            </div>
            <hr />
            <div className="containercart d_flex">
                <div className="cart-details">
                {cart.length === 0 ? (
                    <h1 className="no-items product">No Items are added to Cart</h1>
                ) : (
                    cart.map((item) => (
                    <div className="cart-list product d_flex" key={item.item_id}>
                        <div className="imgcart">
                        <img 
                            src={item.item_image ? item.item_image : placeholderImage} 
                            alt='' 
                            className='product-image' 
                        />
                        </div>
                        <div className="cart-info">
                        <h3>{item.item_description}</h3>
                        <div className="mb-1">Available Quantity: {item.quality_stocks}</div>
                            <div className="cart-items-function">
                                <div className="cartControl d_flex">
                                    <button 
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                                        disabled={item.quantity <= 1 || isNaN(item.quantity)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <span className="item-qty">{item.quantity}</span>
                                    <button 
                                        className="qty-btn"
                                        onClick={() => {
                                            const newQuantity = isNaN(item.quantity) ? 1 : item.quantity + 1;
                                            updateQuantity(item.item_id, newQuantity);
                                        }}
                                    >
                                        <i className="fa fa-add"></i>
                                    </button>
                                </div>
                                <div className="price mt-1"><strong>₱{(item.totalAmount).toFixed(2)}</strong></div>
                            </div>
                        </div>
                        <button 
                            className="removeCart"
                            onClick={() => {
                                removeProduct(item);
                            }}
                        >
                        <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    ))
                )}
                </div>
                <div className="cart-summary product">
                    <h2>Cart Summary</h2>
                    <div className="d_flex">
                        <h4>Total Price:</h4>
                        <h3>₱{totalPrice.toFixed(2)}</h3>
                    </div>
                    <button className="buy-button" onClick={handleBuyClick}>Buy</button>
                </div>
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-inner">
                        <div className="popup-container" style={{ position: 'relative' }}>
                            <button className="close-popup" onClick={closePopup} style={{ position: 'absolute', right: '10px' }}>
                                <i className="bi bi-x-circle"></i>
                            </button>
                            <h2>Checkout</h2>
                        </div>
                        <div className="cart-summary mt-2">
                        <h3>Order Summary</h3>
                        {cart.map((item) => (
                            <div key={item.item_id} className="summary-item">
                            <p>{item.item_description} - ₱{item.unit_price} x {item.quantity}</p>
                            <p>₱{(item.totalAmount).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="summary-item">
                            <p>Merchandise Subtotal:</p>
                            <p>₱{totalPrice.toFixed(2)}</p>
                        </div>
                        <div className="summary-item">
                            <p>Shipping Total:</p>
                            <p>₱{shippingCost.toFixed(2)}</p>
                        </div>
                        <div className="summary-item total">
                            <p>Total Payment:</p>
                            <p>₱{finalPrice.toFixed(2)}</p>
                        </div>
                        </div>

                        <div className="payment-methods mt-3">
                            <h3>Payment Method</h3>
                            <div className="payment-buttons">
                                {["Cash on Delivery" , "GCash", "PayMaya", "Card"].map((method) => (
                                <button
                                    key={method}
                                    className={`payment-btn ${selectedPaymentMethod === method ? "active" : ""}`} 
                                    onClick={() => {
                                    setCheckoutDetails((prev) => ({ ...prev, paymentMethod: method }));
                                    setSelectedPaymentMethod(method); 
                                    }}
                                >
                                    {method}
                                </button>
                                ))}
                            </div>
                        </div>

                        <div className="location-field">
                            <label htmlFor="location">Delivery Location:</label>
                            <input
                                type="text"
                                id="location"
                                value={checkoutDetails.location}
                                onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, location: e.target.value }))}
                                placeholder="Enter delivery location"
                                className="large-location-input"
                            />
                        </div>

                        <div className="button-container">
                            <button className="confirm-payment" onClick={handleConfirmPayment}>
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    </MainLayout>
  )
}

export default CartPage