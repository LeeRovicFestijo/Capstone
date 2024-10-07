import React, { useState, useEffect, useCallback } from "react";
import "./cart.css";

const Cart = ({ CartItem, addToCart, decreaseQty, handleBuy, removeFromCart }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    location: "",
    paymentMethod: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); 

  const totalPrice = CartItem.reduce((price, item) => price + item.qty * item.price, 0);
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
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (!location) {
      alert("Please enter a delivery location.");
      return;
    }

    handleBuy(finalPrice, location, paymentMethod);
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

  return (
    <section className="cart-items">
      <div className="containercart d_flex">
        <div className="cart-details">
          {CartItem.length === 0 ? (
            <h1 className="no-items product">No Items are added to Cart</h1>
          ) : (
            CartItem.map((item) => (
              <div className="cart-list product d_flex" key={item.id}>
                <div className="imgcart">
                  <img src={item.cover} alt={item.name} />
                </div>
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <div className="cart-items-function">
                    <div className="cartControl d_flex">
                      <button className="desCart" onClick={() => decreaseQty(item)}>
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <span className="item-qty">{item.qty}</span>
                      <button className="incCart" onClick={() => addToCart(item)}>
                        <i className="fa fa-add"></i>
                      </button>
                    </div>
                    <div className="price">₱{(item.price * item.qty).toFixed(2)}</div>
                  </div>
                </div>
                <button className="removeCart" onClick={() => removeFromCart(item.id)}>
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
            <button className="buy-button" onClick={handleBuyClick}>Buy</button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-inner">
            <h2>Checkout</h2>
            <button className="close-popup" onClick={closePopup}>×</button>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              {CartItem.map((item) => (
                <div key={item.id} className="summary-item">
                  <p>{item.name} - ₱{item.price} x {item.qty}</p>
                  <p>₱{(item.price * item.qty).toFixed(2)}</p>
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
                {["Cash on Delivery" , "G Cash"].map((method) => (
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
  );
};

export default Cart;
