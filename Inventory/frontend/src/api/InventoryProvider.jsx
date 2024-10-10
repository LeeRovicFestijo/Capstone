import { createContext, useContext, useState } from 'react';
import usePersistState from '../hooks/usePersistState'; 

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [cart, setCart] = usePersistState('cart', []);
  const [inventoryData, setInventoryData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerLocal, setSelectedCustomerLocal] = useState(null);
  const [isCustomerAdded, setIsCustomerAdded] = useState(false);
  const [persistedAdmin, setPersistedAdmin] = usePersistState('admin', null)
  const [customerName, setCustomerName] = useState(selectedCustomer?.customer_name || '');
  const placeholderImage = "https://via.placeholder.com/150";

  const logout = () => {
    setCart([]);
    setTotalAmount(0);
    setSelectedCustomer(null);
    setSelectedCustomerLocal(null)
    setIsCustomerAdded(false)
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
    <InventoryContext.Provider value={{ cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer,  selectedCustomerLocal, setSelectedCustomerLocal, isCustomerAdded, setIsCustomerAdded, logout, payment, customerName, setCustomerName, persistedAdmin, setPersistedAdmin, inventoryData, setInventoryData }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}