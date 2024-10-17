import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import ProductDetails from './pages/ProductDetails';
import { EcommerceApi } from './Api/EcommerceApi';
import OrderHistoryPage from './pages/OrderHistoryPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <EcommerceApi>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path='/' element={<MainPage/>} />
        <Route path='/product-details' element={<ProductDetails/>} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path='/success' element={<SuccessPage />} />
        <Route path='/cancel' element={<CancelPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
      </Routes>
    </EcommerceApi>
  );
}

export default App;
