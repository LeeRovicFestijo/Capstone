import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./common/header/Header";
import Pages from "./pages/Pages";
import Data from "./components/Data";
import Cart from "./common/Cart/Cart";
import Footer from "./common/footer/Footer";
import Sdata from "./components/shops/Sdata";
import ProductDetails from "./components/shops/ProductDetails"; 
import Profile from "./common/profile/Profile";  // Import the Profile component
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function App() {
  const { productItems } = Data;
  const { shopItems } = Sdata;
  const [CartItem, setCartItem] = useState([]);
  
  // State to handle the profile modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const addToCart = (product) => {
    const productExit = CartItem.find((item) => item.id === product.id);
    if (productExit) {
      setCartItem(
        CartItem.map((item) =>
          item.id === product.id
            ? { ...productExit, qty: productExit.qty + 1 }
            : item
        )
      );
    } else {
      setCartItem([...CartItem, { ...product, qty: 1 }]);
    }
  };

  const decreaseQty = (product) => {
    const productExit = CartItem.find((item) => item.id === product.id);
    if (productExit.qty === 1) {
      setCartItem(CartItem.filter((item) => item.id !== product.id));
    } else {
      setCartItem(
        CartItem.map((item) =>
          item.id === product.id
            ? { ...productExit, qty: productExit.qty - 1 }
            : item
        )
      );
    }
  };

  const allItems = [...productItems, ...shopItems];

  return (
    <Router>
      <Header CartItem={CartItem} />

      <Switch>
        <Route
          path="/"
          exact
          component={() => (
            <Pages
              productItems={productItems}
              addToCart={addToCart}
              shopItems={shopItems}
            />
          )}
        />

        <Route
          path="/cart"
          exact
          component={() => (
            <Cart
              CartItem={CartItem}
              addToCart={addToCart}
              decreaseQty={decreaseQty}
            />
          )}
        />

        <Route
          path="/product/:productId"
          exact
          component={() => (
            <ProductDetails
              allItems={allItems}
              addToCart={addToCart}
            />
          )}
        />

        {/* Profile button trigger, set modal open */}
        <button onClick={() => setIsProfileOpen(true)}>My Profile</button>

        {/* Render Profile modal if it's open */}
        {isProfileOpen && (
          <Profile closeProfile={() => setIsProfileOpen(false)} />
        )}

        {/* Other routes */}
      </Switch>

      <Footer />
    </Router>
  );
}

export default App;
