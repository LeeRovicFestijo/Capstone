import React from 'react';
import './App.css';
import Sidebar from './Sidebar'; // Assuming Sidebar.jsx is in the same directory
import InventoryTable from './InventoryTable'; // Assuming InventoryTable.jsx is in the same directory



function App() {
    return (
        <div className="container">
            <Sidebar />
            <InventoryTable />
        </div>
    );
}

export default App;
