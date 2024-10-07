import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import ProductDetails from './pages/ProductDetails';
import { EcommerceApi } from './Api/EcommerceApi';

function App() {
  return (
    <EcommerceApi>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path='/main' element={<MainPage/>} />
        <Route path='/product-details' element={<ProductDetails/>} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </EcommerceApi>
  );
}

export default App;
