import React, { useState, useEffect, useMemo } from 'react';
import { fetchPurchaseHistory } from '../api/apiClient';
import { useDebounce } from '../hooks/useDebounce';
import { SkeletonPage } from '../components/Skeleton';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(false);
      const data = await fetchPurchaseHistory();
      setHistory(data);
      setFilteredHistory(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    let result = history;

    if (debouncedSearch.trim() !== '') {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(item =>
        (item.clientName || '').toLowerCase().includes(term) ||
        (item.productName || '').toLowerCase().includes(term)
      );
    }

    if (filterPayment !== 'all') {
      result = result.filter(item => item.paymentMethod === filterPayment);
    }

    setFilteredHistory(result);
    setPage(1);
  }, [debouncedSearch, filterPayment, history]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, page]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));

  const totalItemsSold = filteredHistory.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalAmountFiltered = filteredHistory.reduce((acc, item) => acc + (item.subtotal || 0), 0);

  if (loading) return <SkeletonPage />;

  if (error) return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial de Compras</h1>
          <p className="page-subtitle">Registro de todos los artículos adquiridos por los clientes</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div className="page-title" style={{ fontSize: 18 }}>Error al cargar el historial</div>
        <p className="text-muted" style={{ marginTop: 8 }}>Verifica la conexión con el servidor.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={loadHistory}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial de Compras</h1>
          <p className="page-subtitle">Registro de todos los artículos adquiridos por los clientes</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="clients-summary" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <div className="summary-chip">
          <span className="summary-chip-icon" style={{ background: '#6366f122', color: '#818cf8' }}>📦</span>
          <div>
            <div className="summary-chip-value">{totalItemsSold}</div>
            <div className="summary-chip-label">Artículos Vendidos</div>
          </div>
        </div>
        <div className="summary-chip">
          <span className="summary-chip-icon" style={{ background: '#10b98122', color: '#34d399' }}>💰</span>
          <div>
            <div className="summary-chip-value">${totalAmountFiltered.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
            <div className="summary-chip-label">Monto en Transacciones</div>
          </div>
        </div>
        <div className="summary-chip">
          <span className="summary-chip-icon" style={{ background: '#f59e0b22', color: '#fbbf24' }}>📋</span>
          <div>
            <div className="summary-chip-value">{filteredHistory.length}</div>
            <div className="summary-chip-label">Registros Encontrados</div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="card card-hover" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', margin: 0 }}
          />
        </div>
        <div>
          <select
            className="form-control"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="all">Todos los métodos de pago</option>
            <option value="cash">💵 Efectivo</option>
            <option value="card">💳 Tarjeta</option>
            <option value="transfer">🏦 Transferencia</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredHistory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div className="page-title" style={{ fontSize: 18 }}>No se encontraron registros</div>
          <p className="text-muted" style={{ marginTop: 8 }}>Prueba a ajustar tus filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th style={{ textAlign: 'center' }}>Cantidad</th>
                <th style={{ textAlign: 'right' }}>Precio Unitario</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(item => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ fontWeight: 600 }}>{item.clientName}</td>
                  <td>{item.productName}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>${(item.unitPrice || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-green)' }}>
                    ${(item.subtotal || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {item.paymentMethod === 'cash' ? '💵 Efectivo' : item.paymentMethod === 'card' ? '💳 Tarjeta' : '🏦 Transferencia'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-nav" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <span className="pagination-info">Pág. {page} de {totalPages} ({filteredHistory.length} resultados)</span>
            <button className="pagination-nav" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
          </div>
        )}
    </div>
  );
}
