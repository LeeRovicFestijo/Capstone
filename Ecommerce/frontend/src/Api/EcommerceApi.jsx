import { createContext, useContext, useState } from 'react';
import usePersistState from '../hooks/userPersistState'; 

const EcommerceContext = createContext();

export function EcommerceApi({ children }) {
  const [cart, setCart] = usePersistState('cart', []);
  const [totalAmount, setTotalAmount] = useState(0);
  const [persistedCustomer, setPersistedCustomer] = usePersistState('customer', null);
  const [checkoutDetails, setCheckoutDetails] = useState({
    location: "",
    paymentMethod: "",
  });
  const placeholderImage = "https://placehold.co/600x400?text=No+Image";

  return (
    <EcommerceContext.Provider value={{ cart, setCart, totalAmount, setTotalAmount, persistedCustomer, setPersistedCustomer, placeholderImage, checkoutDetails, setCheckoutDetails }}>
      {children}
    </EcommerceContext.Provider>
  );
}

export function useEcommerce() {
  return useContext(EcommerceContext);
}