import { createContext, useContext, useState } from 'react';

const POSContext = createContext();

export function POSProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerLocal, setSelectedCustomerLocal] = useState(null);
  const [isCustomerAdded, setIsCustomerAdded] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <POSContext.Provider value={{ cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer, selectedCustomerLocal, setSelectedCustomerLocal, isCustomerAdded, setIsCustomerAdded, user, setUser }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  return useContext(POSContext);
}
