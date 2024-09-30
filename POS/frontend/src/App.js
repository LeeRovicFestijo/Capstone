import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import CustomerPage from './pages/CustomerPage';
import TransactionPage from './pages/TransactionPage';
import Accounts from './pages/Accounts';
import { POSProvider } from './api/POSProvider';
import Shipment from './pages/Shipment';

function App() {
  return (
    <POSProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="/pos" element={<POSPage/>} />
          <Route path="/customers" element={<CustomerPage/>} />
          <Route path="/transactions" element={<TransactionPage/>} />
          <Route path="/accounts" element={<Accounts/>} />
          <Route path="/shipment" element={<Shipment/>} />
        </Routes>
      </Router>
    </POSProvider>
    
  );
}

export default App;
