import { createContext, useContext, useState } from 'react';
import usePersistState from '../hooks/userPersistState'; 

const EcommerceContext = createContext();

export function EcommerceApi({ children }) {
  const [cart, setCart] = usePersistState('cart', []);
  const [totalAmount, setTotalAmount] = useState(0);
  const [persistedCustomer, setPersistedCustomer] = usePersistState('customer', null);
  const [locationAddress, setLocationAddress] = usePersistState('locationAddress', null);
  const [paymentMethod, setPaymentMethod] = usePersistState('paymentMethod', null);
  const placeholderImage = "https://placehold.co/600x400?text=No+Image";

  return (
    <EcommerceContext.Provider value={{ cart, setCart, totalAmount, setTotalAmount, persistedCustomer, setPersistedCustomer, placeholderImage, locationAddress, setLocationAddress, paymentMethod, setPaymentMethod }}>
      {children}
    </EcommerceContext.Provider>
  );
}

export function useEcommerce() {
  return useContext(EcommerceContext);
}