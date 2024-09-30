import React from "react";
import { useHistory } from "react-router-dom";
import './style.css';

const FlashCard = ({ product, addToCart }) => { 
  const history = useHistory();

  const goToProductDetails = (productId) => {
    history.push(`/product/${productId}`);
  };

  return (
    <div className="product mtop"> 
      <div className="img" onClick={() => goToProductDetails(product.id)}>
        <img src={product.cover} alt={product.name} />
      </div>
      <div className="fproduct-details">
        <h3 className="fproduct-name">{product.name}</h3>
        <div className="fprice">
          <h4>₱{product.price}</h4>
        </div>
       
      </div>
    </div>
  );
};

export default FlashCard;
