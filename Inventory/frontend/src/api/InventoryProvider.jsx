import { createContext, useContext, useState } from 'react';
import usePersistState from '../hooks/usePersistState'; 

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventoryData, setInventoryData] = useState([]);
  const [restockData, setRestockData] = useState([]);
  const [years, setYears] = useState([]);
  const [persistedAdmin, setPersistedAdmin] = usePersistState('admin', null);

  return (
    <InventoryContext.Provider value={{ persistedAdmin, setPersistedAdmin, inventoryData, setInventoryData, restockData, setRestockData, years, setYears }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}