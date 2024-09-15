import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import POSPage from './pages/POSPage';
import CustomerPage from './pages/CustomerPage';
import TransactionPage from './pages/TransactionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/pos" element={<POSPage/>} />
        <Route path="/customers" element={<CustomerPage/>} />
        <Route path="/transactions" element={<TransactionPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
