import { createContext, useContext, useState } from 'react';
import usePersistState from '../hooks/userPersistState'; 

const EcommerceContext = createContext();

export function EcommerceApi({ children }) {
  const [cart, setCart] = usePersistState('cart', []);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCustomerAdded, setIsCustomerAdded] = useState(false);
  const [persistedCustomer, setPersistedCustomer] = usePersistState('customer', null)
  const [persistedUser, setPersistedUser] = usePersistState('user', null);
  const [customerName, setCustomerName] = useState(selectedCustomer?.customer_name || '');
  const placeholderImage = "https://placehold.co/600x400?text=No+Image";

  const logout = () => {
    setCart([]);
    setTotalAmount(0);
    setSelectedCustomer(null);
    setSelectedCustomerLocal(null)
    setIsCustomerAdded(false)
    setPersistedUser('');
  };

  const payment = () => {
    setCart([]);
    setTotalAmount(0);
    setSelectedCustomer(null);
    setSelectedCustomerLocal(null)
    setIsCustomerAdded(false)
    setCustomerName('')
  };

  return (
    <EcommerceContext.Provider value={{ cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer, persistedCustomer, setPersistedCustomer, selectedCustomerLocal, setSelectedCustomerLocal, isCustomerAdded, setIsCustomerAdded, logout, payment, customerName, setCustomerName, persistedUser, setPersistedUser, placeholderImage }}>
      {children}
    </EcommerceContext.Provider>
  );
}

export function useEcommerce() {
  return useContext(EcommerceContext);
}