import React, { useState, useEffect, useCallback } from "react";
import { useEcommerce } from "../Api/EcommerceApi";
import { toast, Flip } from 'react-toastify';
import MainLayout from '../layout/MainLayout'
import "../style/cart-style.css";

function CartPage() {
    const { cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer, selectedCustomerLocal, setIsCustomerAdded, persistedUser, persistedCustomer, payment, customerName, setCustomerName, placeholderImage } = useEcommerce();
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
      setShowPopup(true);
    };
  
    const closePopup = () => {
      setShowPopup(false);
      setCheckoutDetails({ location: "", paymentMethod: "" }); 
      setSelectedPaymentMethod(""); 
    };
  
    const handleConfirmPayment = () => {
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
      closePopup(); 
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
                const newTotalAmount = cartItem.unit_price * newQuantity;
                console.log(`Updated Total Amount: ${newTotalAmount}`);
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
                <h2>Your Cart</h2>
                <hr />
            </div>
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
                            <div className="cart-items-function">
                                <div className="cartControl d_flex">
                                    <button 
                                        className="desCart"
                                        onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                                        disabled={item.quantity <= 1 || isNaN(item.quantity)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <span className="item-qty">{item.quantity}</span>
                                    <button 
                                        className="incCart"
                                        onClick={() => {
                                            const newQuantity = isNaN(item.quantity) ? 1 : item.quantity + 1;
                                            updateQuantity(item.item_id, newQuantity);
                                        }}
                                    >
                                        <i className="fa fa-add"></i>
                                    </button>
                                </div>
                                <div className="price">₱{(item.totalAmount).toFixed(2)}</div>
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
                        <h2>Checkout</h2>
                        <button className="close-popup" onClick={closePopup}>×</button>

                        <div className="cart-summary">
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

                        <div className="payment-methods">
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