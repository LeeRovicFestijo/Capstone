import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="box">
          <h1>Contact Us</h1>
          <ul>
            <li>70 Washington Square South, New York, NY 10012, United States</li>
            <li>Email: uilib.help@gmail.com</li>
            <li>Phone: +1 1123 456 780</li>
          </ul>
        </div>

        <div className="box">
          <h2>About Us</h2>
          <ul>
            <li>Careers</li>
            <li>Our Stores</li>
            <li>Our Cares</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="box">
          <h2>Customer Care</h2> 
          <ul>
            <li>Help Center</li>
            <li>How to Buy</li>
            <li>Track Your Order</li>
            <li>Corporate & Bulk Purchasing</li>
            <li>Returns & Refunds</li>
          </ul>
        </div>

        <div className="box">
          <h2>SIG BUILDERS</h2> 
        <p>"SIG BUILDER is your one-stop shop for all construction supplies, offering high-quality materials and tools to bring your building projects to life."</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
