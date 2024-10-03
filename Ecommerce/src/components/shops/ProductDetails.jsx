import React from 'react';
import { useParams } from 'react-router-dom';
import './productdetails.css';

function ProductDetails({ allItems, addToCart }) {
  const { productId } = useParams();

  // Find the selected product from merged items
  const selectedProduct = allItems.find((item) => item.id === parseInt(productId));

  if (!selectedProduct) {
    return <div className="not-found">Product not found</div>;
  }

  return (
    <div className="product-details-container">
      <div className="product-details-card">
        <div className="product-image">
          <img src={selectedProduct.cover} alt={selectedProduct.name} />
        </div>
        <div className="product-info">
          <h2 className="product-name">{selectedProduct.name}</h2>
          <p className="product-description">{selectedProduct.description}</p>
          <h4 className="product-price">₱{selectedProduct.price}</h4>
          <button className="add-to-cart-btn" onClick={() => addToCart(selectedProduct)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
