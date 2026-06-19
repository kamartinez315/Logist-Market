import React from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    section: 'Principal',
    items: [
      { id: 'home', label: 'Dashboard', icon: '▦' },
      { id: 'sales', label: 'Ventas', icon: '▤' },
    ],
  },
  {
    section: 'Gestión',
    items: [
      { id: 'clients', label: 'Clientes', icon: '◉' },
      { id: 'products', label: 'Productos', icon: '▢' },
      { id: 'inventory', label: 'Inventario', icon: '▥' },
      { id: 'expenses', label: 'Gastos', icon: '💰' },
    ],
  },
  {
    section: 'Reportes',
    items: [
      { id: 'history', label: 'Historial', icon: '📋' },
      { id: 'settings', label: 'Configuración', icon: '⚙' },
    ],
  },
];

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">K</div>
        {!collapsed && <span className="logo-text">{user?.businessName || 'KMarket'}</span>}
      </div>

      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expandir' : 'Colapsar'}
      >
        <span style={{ display: 'inline-block', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>‹</span>
      </button>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="nav-section">
            {!collapsed && (
              <span className="nav-section-label">{section.section}</span>
            )}
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {activePage === item.id && !collapsed && (
                  <span className="nav-active-dot" />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div
          className="avatar avatar-sm"
          style={{ background: '#2d8a4e', color: '#fff', flexShrink: 0 }}
        >
          {user?.avatar || (user?.name ? user.name[0].toUpperCase() : '?')}
        </div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Usuario'}</div>
            <div className="sidebar-user-role">{user?.businessName || 'KMarket'}</div>
          </div>
        )}
        <button
          className="sidebar-logout-btn"
          onClick={logout}
          title="Cerrar sesión"
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
