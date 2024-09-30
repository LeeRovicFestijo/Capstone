import React from "react";
import "./style.css";
import TopCart from "./TopCart";

const TopCate = () => {
  
  return (
    
    <section className="TopCate background">
      <h2>Top Categories</h2>
      <div className="container">
        <div className="box-container">
          <TopCart />
        </div>
      </div>
    </section>
  );
};

export default TopCate;
