import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import InventoryTable from './pages/InventoryTable';  
import Dashboard from './pages/Dashboard'; 
import Reports from './pages/Reports';  
import Shipment from './pages/Shipment'; 
import Accounts from './pages/Accounts';  
import LoginPage from './pages/LoginPage';
import { InventoryProvider } from './api/InventoryProvider';

function App() {
    return (
        <InventoryProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} /> 
                    <Route path="/dashboard" element={<Dashboard />} /> 
                    <Route path="/inventory" element={<InventoryTable />} />  
                    <Route path="/reports" element={<Reports />} /> 
                    <Route path="/shipment" element={<Shipment />} /> 
                    <Route path="/accounts" element={<Accounts />} />
                </Routes>
            </Router>
        </InventoryProvider>
    );
}

export default App;
