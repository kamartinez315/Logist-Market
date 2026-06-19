import React, { useState, useEffect, useCallback } from 'react';
import { fetchDashboardStats, fetchClients, fetchTimeseries } from '../api/apiClient';
import ChartPanel from '../components/ChartPanel';

// ── Metric config ─────────────────────────────────────────
const METRIC_CONFIG = {
  'Ingresos': { metric: 'revenue', color: '#22c55e', icon: '$', isMoney: true },
  'Ventas totales': { metric: 'sales', color: '#3b82f6', icon: '#', isMoney: false },
  'Beneficio bruto': { metric: 'benefit', color: '#0891b2', icon: '$', isMoney: true },
};

// ── KPI Card (clicable) ───────────────────────────────────
function KpiCard({ label, value, sub, trend, color, isActive, onClick }) {
  const trendUp = trend >= 0;
  const cfg = METRIC_CONFIG[label] || {};
  return (
    <div
      className="kpi-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderColor: isActive ? color : undefined,
        boxShadow: isActive ? `0 0 0 2px ${color}30, var(--shadow-sm)` : undefined,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.18s ease',
        userSelect: 'none',
      }}
    >
      {/* active bottom indicator */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: color, borderRadius: '0 0 var(--radius) var(--radius)'
        }} />
      )}
      <div className="kpi-icon" style={{ background: color + '18', color }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>{cfg.icon || '▢'}</span>
      </div>
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-sub">
          <span className={`kpi-trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span>{sub}</span>
        </div>
      </div>
      {/* click hint */}
      <div style={{
        position: 'absolute', top: 8, right: 10,
        fontSize: 10, color: isActive ? color : 'var(--text-muted)',
        fontWeight: 600, letterSpacing: '0.03em', opacity: isActive ? 1 : 0.6
      }}>
        {isActive ? '▲ ocultar' : '▼ ver gráfica'}
      </div>
    </div>
  );
}



// ── Recent Sales Table ────────────────────────────────────
function RecentSales({ sales }) {
  const paymentLabel = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th># Venta</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Método</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td><span className="badge badge-indigo">{s.id}</span></td>
              <td>{s.clientName || 'Consumidor Final'}</td>
              <td className="text-muted text-sm">{new Date(s.saleDate || s.createdAt).toLocaleDateString()}</td>
              <td>{paymentLabel[s.paymentMethod] || '—'}</td>
              <td style={{ textAlign: 'right', fontWeight: 700, color: '#2d8a4e' }}>
                ${parseFloat(s.totalAmount || s.total || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Low Stock Alert ───────────────────────────────────────
function LowStockAlert({ products }) {
  const low = products.filter(p => p.stock <= 5);
  return (
    <div className="stock-list">
      {low.length === 0 ? (
        <div className="empty-state">Todo el stock está en orden</div>
      ) : (
        low.map(p => (
          <div key={p.id} className="stock-item">
            <div className="stock-item-left">
              <span className="stock-dot" style={{ background: p.stock === 0 ? '#dc2626' : '#d97706' }} />
              <div>
                <div className="stock-name">{p.name}</div>
                <div className="text-xs text-muted">{p.category || 'Sin categoría'}</div>
              </div>
            </div>
            <div className="stock-qty">
              <span className={`badge ${p.stock === 0 ? 'badge-rose' : 'badge-amber'}`}>
                {p.stock === 0 ? 'Sin stock' : `${p.stock} unid.`}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Top Clients ───────────────────────────────────────────
function TopClients({ clients }) {
  const top = [...clients].sort((a, b) => Number(b.totalSpent || 0) - Number(a.totalSpent || 0)).slice(0, 5);
  return (
    <div className="top-clients-list">
      {top.map((c, i) => (
        <div key={c.id} className="top-client-item">
          <div className="top-client-rank">#{i + 1}</div>
          <div className="avatar avatar-sm" style={{ background: c.avatarColor || '#ccc', color: '#fff' }}>
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div className="top-client-info">
            <div className="top-client-name">{c.name}</div>
            <div className="text-xs text-muted">{c.totalPurchases || 0} compras</div>
          </div>
          <div className="top-client-spent">${parseFloat(c.totalSpent || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────
export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashStats, allClients] = await Promise.all([
          fetchDashboardStats(),
          fetchClients()
        ]);
        setStats(dashStats);
        setClients(allClients);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCardClick = useCallback((label) => {
    setActiveCard(prev => prev === label ? null : label);
  }, []);

  if (loading || !stats) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando datos del dashboard...</div>;
  }

  const kpiCards = [
    { label: 'Ingresos', value: `$${parseFloat(stats.totalRevenue || 0).toFixed(2)}`, sub: 'total en el sistema', trend: 0 },
    { label: 'Ventas totales', value: stats.totalSalesCount, sub: 'transacciones', trend: 0 },
    { label: 'Beneficio bruto', value: `$${parseFloat(stats.totalProfit || 0).toFixed(2)}`, sub: 'costo vs venta de productos', trend: 0 },
  ];

  const activeConfig = activeCard ? METRIC_CONFIG[activeCard] : null;

  return (
    <div>
      {/* CSS animations injected once */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de tu negocio · Haz clic en una tarjeta para ver su gráfica</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map(card => {
          const cfg = METRIC_CONFIG[card.label] || {};
          return (
            <KpiCard
              key={card.label}
              label={card.label}
              value={card.value}
              sub={card.sub}
              trend={card.trend}
              color={cfg.color || '#6b7280'}
              isActive={activeCard === card.label}
              onClick={() => handleCardClick(card.label)}
            />
          );
        })}
      </div>

      {/* Expandable Chart Panel */}
      {activeCard && activeConfig && (
        <ChartPanel
          key={activeCard}
          label={activeCard}
          color={activeConfig.color}
          isMoney={activeConfig.isMoney}
          fetchData={(period) => fetchTimeseries(activeConfig.metric, period)}
        />
      )}

      {/* Charts row */}
      <div className="dashboard-grid-2" style={{ gridTemplateColumns: '1fr' }}>
        {/* Top clients */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top Clientes</div>
              <div className="card-subtitle">Por gasto total</div>
            </div>
            <span className="badge badge-indigo">Top 5</span>
          </div>
          <TopClients clients={clients} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="dashboard-grid-3">
        {/* Recent sales */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Últimas Ventas</div>
              <div className="card-subtitle">Transacciones recientes</div>
            </div>
          </div>
          <RecentSales sales={stats.recentSales} />
        </div>

        {/* Low stock */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Stock Bajo</div>
              <div className="card-subtitle">Requieren reposición</div>
            </div>
            <span className="badge badge-rose">Alerta</span>
          </div>
          <LowStockAlert products={stats.lowStockProducts} />
        </div>
      </div>
    </div>
  );
}
