import React from "react";
import { useHistory } from "react-router-dom";
import './shop.css';

const ShopCart = ({ shopItems }) => {
  const history = useHistory();

  const goToProductDetails = (productId) => {
    history.push(`/product/${productId}`);
  };

  return (
    <>
      <div className="shop-product-container">
        {shopItems.map((shopItem) => (
          <div className="product mtop" key={shopItem.id}>
            <div className="shopproduct" onClick={() => goToProductDetails(shopItem.id)}>
              <img src={shopItem.cover} alt={shopItem.name} />
            </div>
            <div className="product-details">
              <h3 className="product-name">{shopItem.name}</h3>
              <div className="price">
                <h4>₱{shopItem.price}</h4>
              </div>
              <div className="actions">
                <button className="view-details-btn" onClick={() => goToProductDetails(shopItem.id)}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ShopCart;
