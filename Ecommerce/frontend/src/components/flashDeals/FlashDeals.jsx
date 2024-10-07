import React from "react";
import Slider from "react-slick";
import FlashCard from "./FlashCard";
import "./style.css";

const PrevArrow = (props) => (
  <button className="slick-prev" onClick={props.onClick}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#1B305B">
      <path d="M15.5,18l-6-6l6-6v12H15.5z" />
    </svg>
  </button>
);

const NextArrow = (props) => (
  <button className="slick-next" onClick={props.onClick}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#1B305B">
      <path d="M8.5,6l6,6l-6,6V6H8.5z" />
    </svg>
  </button>
);

const FlashDeals = ({ productItems, addToCart }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true, 
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        },
      },
    ],
  };

  return (
    <section className="flash">
      <div className="container">
        <div className="heading f_flex">
          <h1> Flash Deals</h1>
        </div>
        <div className="flash-card-container">
          <Slider {...settings}>
            {productItems.map((item, index) => (
              <FlashCard key={index} product={item} addToCart={addToCart} />
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;
