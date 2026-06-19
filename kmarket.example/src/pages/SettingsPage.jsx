import React, { useState, useEffect, useRef } from 'react';
import { fetchSettings, updateSettings, uploadAvatar, updateBusinessName } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const { user, updateUserAvatar, updateUserBusinessName } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const [shopName, setShopName] = useState(user?.businesses?.[0]?.name || 'Logistics Market');
  const [currency, setCurrency] = useState('DOP');

  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchSettings();
        if (data.shopName) setShopName(data.shopName);
        if (data.currency) setCurrency(data.currency);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveGeneral(e) {
    e.preventDefault();
    try {
      await updateSettings({ shopName, currency });
      await updateBusinessName(shopName);
      updateUserBusinessName(shopName);
      toast('Configuraciones guardadas exitosamente.', 'success');
    } catch (err) {
      console.error(err);
      toast('Error al guardar configuraciones.', 'error');
    }
  }

  function handleDarkModeChange(isDark) {
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadAvatar(file);
      updateUserAvatar(result.avatar);
      toast('Foto de perfil actualizada.', 'success');
    } catch (err) {
      toast(err.message || 'Error al subir la foto.', 'error');
    }
  }

  function avatarContent() {
    if (user?.avatar && (user.avatar.startsWith('/') || user.avatar.startsWith('http'))) {
      return <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return user?.avatar || (user?.name ? user.name[0].toUpperCase() : '?');
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando configuración...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Ajustes generales del sistema y preferencias</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <div className="card" style={{ width: 250, flexShrink: 0, padding: '16px 0' }}>
          <div 
            style={{ padding: '12px 24px', cursor: 'pointer', background: activeTab === 'general' ? 'var(--bg-secondary)' : 'transparent', borderLeft: activeTab === 'general' ? '3px solid var(--accent-indigo)' : '3px solid transparent', fontWeight: activeTab === 'general' ? 600 : 400 }}
            onClick={() => setActiveTab('general')}
          >
            🏢 Negocio
          </div>
          <div 
            style={{ padding: '12px 24px', cursor: 'pointer', background: activeTab === 'appearance' ? 'var(--bg-secondary)' : 'transparent', borderLeft: activeTab === 'appearance' ? '3px solid var(--accent-indigo)' : '3px solid transparent', fontWeight: activeTab === 'appearance' ? 600 : 400 }}
            onClick={() => setActiveTab('appearance')}
          >
            🎨 Apariencia
          </div>
          <div 
            style={{ padding: '12px 24px', cursor: 'pointer', background: activeTab === 'user' ? 'var(--bg-secondary)' : 'transparent', borderLeft: activeTab === 'user' ? '3px solid var(--accent-indigo)' : '3px solid transparent', fontWeight: activeTab === 'user' ? 600 : 400 }}
            onClick={() => setActiveTab('user')}
          >
            👤 Cuenta
          </div>
        </div>

        <div style={{ flexGrow: 1 }}>
          {activeTab === 'general' && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 20, marginBottom: 24 }}>Detalles del Negocio</h2>
              <form onSubmit={handleSaveGeneral}>
                <div className="form-group">
                  <label className="form-label">Nombre de la Tienda</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={shopName} 
                    onChange={e => setShopName(e.target.value)} 
                    required 
                  />
                  <p className="text-xs text-muted" style={{ marginTop: 4 }}>Aparecerá en los tickets y reportes.</p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Moneda Principal</label>
                  <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="DOP">Peso Dominicano (DOP)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                  </select>
                </div>

                <div style={{ marginTop: 32, borderTop: '1px solid var(--border-color)', paddingTop: 24, textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 20, marginBottom: 24 }}>Apariencia del Sistema</h2>
              
              <div className="form-group">
                <label className="form-label">Tema Visual</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  <div 
                    onClick={() => handleDarkModeChange(false)}
                    style={{ 
                      flex: 1, 
                      padding: 24, 
                      border: !darkMode ? '2px solid var(--accent-indigo)' : '2px solid var(--border-color)', 
                      borderRadius: 12, 
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>☀️</div>
                    <div style={{ fontWeight: 600 }}>Modo Claro</div>
                  </div>
                  
                  <div 
                    onClick={() => handleDarkModeChange(true)}
                    style={{ 
                      flex: 1, 
                      padding: 24, 
                      border: darkMode ? '2px solid var(--accent-indigo)' : '2px solid var(--border-color)', 
                      borderRadius: 12, 
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: '#0f172a',
                      color: '#f8fafc'
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🌙</div>
                    <div style={{ fontWeight: 600 }}>Modo Oscuro</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'user' && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 20, marginBottom: 24 }}>Perfil de Administrador</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                <div style={{ position: 'relative', width: 80, height: 80 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', overflow: 'hidden' }}>
                    {avatarContent()}
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', border: '2px solid var(--card-bg)' }}
                    title="Cambiar foto"
                  >
                    📷
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    style={{ display: 'none' }} 
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{user?.name || 'Usuario'}</h3>
                  <p className="text-muted" style={{ margin: 0 }}>{user?.email || ''}</p>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input className="form-input" type="text" value={user?.name || ''} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input className="form-input" type="email" value={user?.email || ''} disabled />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
