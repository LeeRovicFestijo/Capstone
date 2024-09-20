import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SampleNextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className='control-btn' onClick={onClick}>
      <button className='next'>
        <i className='fa fa-long-arrow-alt-right'></i>
      </button>
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className='control-btn' onClick={onClick}>
      <button className='prev'>
        <i className='fa fa-long-arrow-alt-left'></i>
      </button>
    </div>
  );
};

const FlashCard = ({ productItems, addToCart }) => {
  const [likes, setLikes] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const incrementLikes = (id) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: (prevLikes[id] || 0) + 1,
    }));
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  const openPopup = (product) => {
    setSelectedProduct(product);
    setPopupVisible(true);
    setSelectedSize(product.sizes ? product.sizes[0] : ""); 
    setQuantity(1); 
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedProduct(null);
  };

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  return (
    <>
      <Slider {...settings}>
        {productItems.map((item) => (
          <div className='box' key={item.id}>
            <div className='product mtop'>
              <div className='img' onClick={() => openPopup(item)}>
                <span className='discount'>{item.discount}% Off</span>
                <img src={item.cover} alt={item.name} />
                <div className='product-like'>
                  <label>{likes[item.id] || 0}</label> <br />
                  <i
                    className='fa-regular fa-heart'
                    onClick={() => incrementLikes(item.id)}
                  ></i>
                </div>
              </div>
              <div className='product-details'>
                <h3>{item.name}</h3>
                <div className='price'>
                  <h4>₱{item.price}</h4>
                  
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <div className={`product-popup ${popupVisible ? 'show' : ''}`}>
  <div className='popup-content'>
    <span className='close-popup' onClick={closePopup}>
      &times;
    </span>
    {selectedProduct && (
      <div className='popup-inner'>
        <div className='left-side'>
          <img src={selectedProduct.cover} alt={selectedProduct.name} />
          <h3>{selectedProduct.name}</h3>
          <p>{selectedProduct.description}</p>
          <h4>₱{selectedProduct.price}</h4>
        </div>

        <div className='right-side'>
          {selectedProduct.sizes && (
            <div className='size-selection'>
              <label htmlFor='size'>Size:</label>
              <select
                id='size'
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

          <div className='quantity-selection'>
            <label htmlFor='quantity'>Quantity:</label>
            <input
              type='number'
              id='quantity'
              value={quantity}
              min='1'
              onChange={handleQuantityChange}
            />
          </div>

          <button
            className='add-to-cart-btn'
            onClick={() => addToCart({ ...selectedProduct, selectedSize, quantity })}
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

export default FlashCard;
