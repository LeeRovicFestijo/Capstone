import React from "react";
import "./wrapper.css";

const Wrapper = () => {
  const data = [
    {
      cover: <i className="fa-solid fa-truck-fast"></i>,
      title: "Fast Delivery",
      decs: "Your Trusted Delivery Partner.",
    },
    {
      cover: <i className="fa-solid fa-id-card"></i>,
      title: "Safe Payment",
      decs: "Ensure your payment security.",
    },
    {
      cover: <i className="fa-solid fa-shield"></i>,
      title: "Shop With Confidence",
      decs: "Products and all in good quality.",
    },
    {
      cover: <i className="fa-solid fa-headset"></i>,
      title: "Good Customer Service",
      decs: "Products are offered at affordable prices.",
    },
  ];

  return (
    <section className="wrapper background">
      <div className="container grid2">
        {data.map((val) => {
          return (
            <div className="product" key={val.title}>
              <div className="img icon-circle">
                {val.cover}
              </div>
              <h3>{val.title}</h3>
              <p>{val.decs}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Wrapper;
