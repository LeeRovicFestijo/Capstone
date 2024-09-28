import React from "react";
import { useHistory } from "react-router-dom";
import './style.css';

const FlashCard = ({ productItems, addToCart }) => {
  const history = useHistory();

  const goToProductDetails = (productId) => {
    history.push(`/product/${productId}`);
  };

  return (
    <>
      <div className="product-container">
        {productItems.map((item) => (
          <div className="product mtop" key={item.id}>
            <div className="img" onClick={() => goToProductDetails(item.id)}>
              <img src={item.cover} alt={item.name} />
            </div>
            <div className="product-details">
              <h3 className="product-name">{item.name}</h3>
              <div className="price">
                <h4>₱{item.price}</h4>
              </div>
              
              
                <button className="view-details-btn" onClick={() => goToProductDetails(item.id)}>
                  View Details
                </button>
              </div>
            </div>
          
        ))}
      </div>
    </>
  );
};

export default FlashCard;
