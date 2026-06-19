import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.businessName) {
      setError('Completa todos los campos');
      return;
    }
    if (form.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.businessName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">K</div>
        <h1 className="auth-title">Crear Negocio</h1>
        <p className="auth-subtitle">Registra tu empresa en Logistics Market</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del negocio</label>
            <input className="form-input" placeholder="Mi Tienda" value={form.businessName} onChange={e => set('businessName', e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Tu nombre completo</label>
            <input className="form-input" placeholder="Carlos Admin" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" placeholder="admin@mitienda.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="Mínimo 4 caracteres" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creando negocio...' : 'Crear Negocio'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <button className="auth-link" onClick={onSwitchToLogin}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}
