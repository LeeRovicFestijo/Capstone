import { createContext, useContext, useState } from 'react';
import usePersistState from '../hooks/usePersistState'; 

const POSContext = createContext();

export function POSProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerLocal, setSelectedCustomerLocal] = useState(null);
  const [isCustomerAdded, setIsCustomerAdded] = useState(false);
  const [user, setUser] = useState(null);
  const [persistedUser, setPersistedUser] = usePersistState('user', null);
  const [customerName, setCustomerName] = useState(selectedCustomer?.customer_name || '');

  const logout = () => {
    setCart([]);
    setTotalAmount(0);
    setSelectedCustomer(null);
    setSelectedCustomerLocal(null)
    setIsCustomerAdded(false)
    setUser(null);
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
    <POSContext.Provider value={{ cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer, selectedCustomerLocal, setSelectedCustomerLocal, isCustomerAdded, setIsCustomerAdded, user, setUser, logout, payment, customerName, setCustomerName, persistedUser, setPersistedUser }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  return useContext(POSContext);
}
