import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Building2, CreditCard } from 'lucide-react';
import DashboardComponent from './components/Dashboard';
import Investments from './components/Investments';
import Assets from './components/Assets';
import Liabilities from './components/Liabilities';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-container">
            <div className="header-content">
              <div className="header-logo">
                <img src="/logo.png" alt="Logo" onError={(e) => {
                  // Fallback to a simple icon if logo doesn't exist
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }} />
                <div className="logo-fallback" style={{display: 'none'}}>
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="28" cy="28" r="28" fill="#3b82f6"/>
                    <path d="M28 16V40M20 24H36" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M24 32L28 28L32 32" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="header-text">
                <h1 className="header-title">Personal Finance Tracker</h1>
                <p className="header-subtitle">Manage your investments, assets, and liabilities all in one place</p>
              </div>
            </div>
          </div>
        </header>
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-tab-list">
              <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/investments" icon={Briefcase}>Investments</NavLink>
              <NavLink to="/assets" icon={Building2}>Assets</NavLink>
              <NavLink to="/liabilities" icon={CreditCard}>Liabilities</NavLink>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardComponent />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/liabilities" element={<Liabilities />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon: Icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`nav-tab-button ${isActive ? 'active' : ''}`}>
      <Icon size={16} />
      <span>{children}</span>
    </Link>
  );
}

export default App;

