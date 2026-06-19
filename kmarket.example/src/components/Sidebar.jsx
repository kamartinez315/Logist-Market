import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Users, Package, Boxes, DollarSign, ScrollText, Settings, ChevronLeft, LogOut } from 'lucide-react';

const navItems = [
  {
    section: 'Principal',
    items: [
      { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'sales', label: 'Ventas', icon: ShoppingCart },
    ],
  },
  {
    section: 'Gestión',
    items: [
      { id: 'clients', label: 'Clientes', icon: Users },
      { id: 'products', label: 'Productos', icon: Package },
      { id: 'inventory', label: 'Inventario', icon: Boxes },
      { id: 'expenses', label: 'Gastos', icon: DollarSign },
    ],
  },
  {
    section: 'Reportes',
    items: [
      { id: 'history', label: 'Historial', icon: ScrollText },
      { id: 'settings', label: 'Configuración', icon: Settings },
    ],
  },
];

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        {!collapsed && <span className="logo-text">{user?.businessName || 'Logistics Market'}</span>}
      </div>

      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expandir' : 'Colapsar'}
      >
        <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="nav-section">
            {!collapsed && (
              <span className="nav-section-label">{section.section}</span>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => setActivePage(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-icon"><Icon size={18} /></span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                  {activePage === item.id && !collapsed && (
                    <span className="nav-active-dot" />
                  )}
                </button>
              );
            })}
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
            <div className="sidebar-user-role">{user?.businessName || 'Logistics Market'}</div>
          </div>
        )}
        <button
          className="sidebar-logout-btn"
          onClick={logout}
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
