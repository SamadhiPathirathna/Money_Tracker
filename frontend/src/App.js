// App.js
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Tracker from './Tracker';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <Router>
      <nav className="nav">
        <Link to="/">Tracker</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Tracker />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
