import React, { useState } from "react";

const ShopCart = ({ shopItems, addToCart }) => {
  const [likes, setLikes] = useState(Array(shopItems.length).fill(0));
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(""); // State for size selection
  const [quantity, setQuantity] = useState(1); // State for quantity selection

  const increment = (index) => {
    const newLikes = [...likes];
    newLikes[index] += 1;
    setLikes(newLikes);
  };

  const openPopup = (shopItem) => {
    setSelectedProduct(shopItem);
    setSelectedSize(shopItem.sizes ? shopItem.sizes[0] : ""); // Set initial size if available
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedProduct(null);
    setQuantity(1); // Reset quantity when closing the popup
  };

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  return (
    <>
      {shopItems.map((shopItem, index) => (
        <div className="product mtop" key={index}>
          <div className="img" onClick={() => openPopup(shopItem)}>
            <img src={shopItem.cover} alt={shopItem.name} />
            <div className="product-like">
              <label>{likes[index]}</label> <br />
              <i
                className="fa-regular fa-heart"
                onClick={() => increment(index)}
              ></i>
            </div>
          </div>
          <div className="product-details">
            <h3 className="product-name">{shopItem.name}</h3>
            <div className="price">
              <h4>₱{shopItem.price}</h4>
              
            </div>
          </div>
        </div>
      ))}

      <div className={`product-popup ${popupVisible ? "show" : ""}`}>
        <div className="popup-content">
          <span className="close-popup" onClick={closePopup}>
            &times;
          </span>
          {selectedProduct && (
            <div className="popup-inner">
              <div className="left-side">
                <img src={selectedProduct.cover} alt={selectedProduct.name} />
                <h3>{selectedProduct.name}</h3>
                <p>{selectedProduct.description}</p>
                <h4>₱{selectedProduct.price}</h4>
              </div>
              <div className="right-side">
                {selectedProduct.sizes && (
                  <div className="size-selection">
                    <label htmlFor="size">Size:</label>
                    <select
                      id="size"
                      value={selectedSize}
                      onChange={handleSizeChange}
                    >
                      {selectedProduct.sizes.map((size, index) => (
                        <option key={index} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="quantity-selection">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    min="1"
                    onChange={handleQuantityChange}
                  />
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={() =>
                    addToCart({ ...selectedProduct, selectedSize, quantity })
                  }
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopCart;
