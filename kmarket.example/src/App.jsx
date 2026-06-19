import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardHome from './pages/DashboardHome';
import ClientsPage from './pages/ClientsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import ExpensesPage from './pages/ExpensesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [authView, setAuthView] = useState('login');
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }, []);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div className="auth-logo">K</div>
          <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'register'
      ? <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
      : <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  function renderPage() {
    switch (activePage) {
      case 'home':      return <DashboardHome />;
      case 'clients':   return <ClientsPage />;
      case 'sales':     return <SalesPage />;
      case 'products':  return <ProductsPage />;
      case 'inventory': return <InventoryPage />;
      case 'history':   return <HistoryPage />;
      case 'expenses':  return <ExpensesPage />;
      case 'settings':  return <SettingsPage />;
      default:          return <DashboardHome />;
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      {!collapsed && (
        <div 
          className="sidebar-overlay md-hidden" 
          onClick={() => setCollapsed(true)} 
        />
      )}
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Topbar activePage={activePage} collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="page-content" key={activePage}>
          <ErrorBoundary>
            <div className="page-enter">
              {renderPage()}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
