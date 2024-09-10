import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import InventoryTable from './InventoryTable';

function App() {
    return (
        <div className="container">
            <Sidebar />
            <InventoryTable />
        </div>
    );
}

export default App;
