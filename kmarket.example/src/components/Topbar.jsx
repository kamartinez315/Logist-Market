import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, ChevronDown } from 'lucide-react';

const pageLabels = {
  home: 'Dashboard',
  sales: 'Ventas',
  clients: 'Clientes',
  products: 'Productos',
  inventory: 'Inventario',
  expenses: 'Gastos',
  reports: 'Estadísticas',
  history: 'Historial',
  settings: 'Configuración',
};

export default function Topbar({ activePage, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  return (
    <header className={`topbar ${collapsed ? 'collapsed' : ''}`}>
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn-icon mobile-menu-btn md-hidden"
          onClick={() => setCollapsed(!collapsed)}
          style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Menu size={18} />
        </button>
        <div className="topbar-breadcrumb">
          <span className="topbar-breadcrumb-home">Logistics Market</span>
          <span className="topbar-breadcrumb-sep">›</span>
          <span className="topbar-breadcrumb-current">{pageLabels[activePage] || activePage}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-date">
          {new Date().toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        <div className="topbar-user" ref={menuRef} onClick={() => setShowMenu(!showMenu)}>
          <div
            className="avatar avatar-sm"
            style={{ background: '#2d8a4e', color: '#fff', cursor: 'pointer' }}
          >
            {user?.avatar || (user?.name ? user.name[0].toUpperCase() : '?')}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name?.split(' ').slice(0, 2).join(' ') || 'Usuario'}</span>
            <span className="topbar-user-role">{user?.businessName || 'Logistics Market'}</span>
          </div>
          <ChevronDown size={12} style={{ color: 'var(--text-muted)', marginLeft: 2 }} />

          {showMenu && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-item topbar-dropdown-danger" onClick={logout}>Cerrar sesión</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
