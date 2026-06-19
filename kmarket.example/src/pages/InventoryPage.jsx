import React, { useState, useEffect, useMemo } from 'react';
import { fetchInventoryMovements, fetchInventoryStats, fetchProducts } from '../api/apiClient';
import AdjustStockModal from '../components/AdjustStockModal';
import { useToast } from '../components/Toast';
import { SkeletonPage } from '../components/Skeleton';

export default function InventoryPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('stock');
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    valorInventarioTotal: 0,
    valorVentaTotal: 0,
    beneficioPotencial: 0,
    margen: 0,
    totalProducts: 0,
    totalMovements: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Stock tab filters
  const [stockSearch, setStockSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Movements tab filters
  const [movSearch, setMovSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [movData, statsData, prodData] = await Promise.all([
        fetchInventoryMovements(),
        fetchInventoryStats(),
        fetchProducts()
      ]);
      setMovements(movData);
      setStats({
        ...statsData,
        totalProducts: prodData.length,
        totalMovements: movData.length,
        lowStockCount: prodData.filter(p => p.stock <= 5).length
      });
      setProducts(prodData);
    } catch (err) {
      console.error(err);
      toast('Error al cargar datos de inventario', 'error');
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch = !stockSearch || p.name.toLowerCase().includes(stockSearch.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
    return list;
  }, [products, stockSearch, categoryFilter]);

  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      const matchSearch = !movSearch ||
        mov.productName?.toLowerCase().includes(movSearch.toLowerCase());
      const matchType = typeFilter === 'all' || mov.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [movements, movSearch, typeFilter]);

  function openAdjustStock(product = null) {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  }

  function handleModalSave() {
    setShowAdjustModal(false);
    setSelectedProduct(null);
    loadData();
  }

  function handleModalClose() {
    setShowAdjustModal(false);
    setSelectedProduct(null);
  }

  // Pagination
  const [stockPage, setStockPage] = useState(1);
  const [movPage, setMovPage] = useState(1);
  const pageSize = 10;

  const paginatedProducts = useMemo(() => {
    const start = (stockPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, stockPage]);

  const paginatedMovements = useMemo(() => {
    const start = (movPage - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, movPage]);

  const stockTotalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const movTotalPages = Math.max(1, Math.ceil(filteredMovements.length / pageSize));

  useEffect(() => { setStockPage(1); }, [stockSearch, categoryFilter]);
  useEffect(() => { setMovPage(1); }, [movSearch, typeFilter]);

  const lowStockCount = stats.lowStockCount;

  if (loading) return <SkeletonPage />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">{stats.totalProducts} productos · {stats.totalMovements} movimientos</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAdjustStock()}>＋ Ajustar Stock</button>
      </div>

      <div className="clients-summary">
        <div className="summary-chip">
          <span className="summary-chip-icon" style={{ background: '#6366f122', color: '#818cf8' }}>📦</span>
          <div>
            <div className="summary-chip-value">{stats.totalProducts}</div>
            <div className="summary-chip-label">Total Productos</div>
          </div>
        </div>
        <div className="summary-chip">
          <span className="summary-chip-icon" style={{ background: '#3b82f622', color: '#3b82f6' }}>$</span>
          <div>
            <div className="summary-chip-value">${stats.valorInventarioTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
            <div className="summary-chip-label">Valor Inventario</div>
          </div>
        </div>
        <div className="summary-chip">
          <span className="summary-chip-icon" style={{ background: '#10b98122', color: '#10b981' }}>$</span>
          <div>
            <div className="summary-chip-value">${stats.valorVentaTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
            <div className="summary-chip-label">Valor Venta Total</div>
          </div>
        </div>
        <div className="summary-chip" style={{ borderColor: lowStockCount > 0 ? '#ef444440' : undefined }}>
          <span className="summary-chip-icon" style={{ background: lowStockCount > 0 ? '#ef444422' : '#f59e0b22', color: lowStockCount > 0 ? '#ef4444' : '#f59e0b' }}>!</span>
          <div>
            <div className="summary-chip-value" style={{ color: lowStockCount > 0 ? '#ef4444' : undefined }}>{lowStockCount}</div>
            <div className="summary-chip-label">Bajo Stock</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('stock')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: activeTab === 'stock' ? 700 : 500,
            color: activeTab === 'stock' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'stock' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'all 0.15s ease',
            marginBottom: -1
          }}
        >
          📊 Resumen de Stock
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: activeTab === 'movements' ? 700 : 500,
            color: activeTab === 'movements' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'movements' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'all 0.15s ease',
            marginBottom: -1
          }}
        >
          📋 Movimientos
        </button>
      </div>

      {/* Tab: Stock Overview */}
      {activeTab === 'stock' && (
        <div>
          <div className="clients-toolbar">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Buscar producto..." value={stockSearch} onChange={e => setStockSearch(e.target.value)} />
            </div>
            <div className="toolbar-filters">
              <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'Todas las categorías' : c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="results-count">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} {stockSearch && `para "${stockSearch}"`}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <div className="page-title" style={{ fontSize: 18 }}>Sin resultados</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Costo</th>
                    <th>Stock</th>
                    <th>Valor Inventario</th>
                    <th>Margen</th>
                    <th style={{ textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map(p => {
                    const valorInv = p.stock * (parseFloat(p.cost) || 0);
                    const margen = p.price > 0 ? ((p.price - (p.cost || 0)) / p.price) * 100 : 0;
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td><span className="badge badge-indigo">{p.category || 'N/A'}</span></td>
                        <td style={{ fontWeight: 600 }}>${parseFloat(p.price).toFixed(2)}</td>
                        <td className="text-muted">${parseFloat(p.cost || 0).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${p.stock <= 0 ? 'badge-rose' : p.stock <= 5 ? 'badge-amber' : 'badge-green'}`}>
                            {p.stock <= 0 ? '🚫 Agotado' : p.stock <= 5 ? `⚠️ ${p.stock} unid.` : `✅ ${p.stock}`}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>${valorInv.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: margen >= 40 ? '#10b981' : margen >= 20 ? '#f59e0b' : '#ef4444'
                          }}>
                            {margen.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            <button className="btn btn-sm btn-secondary" onClick={() => openAdjustStock(p)}>
                              📦 Ajustar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {stockTotalPages > 1 && (
            <div className="pagination">
              <button className="pagination-nav" disabled={stockPage === 1} onClick={() => setStockPage(p => Math.max(1, p - 1))}>‹</button>
              <span className="pagination-info">Pág. {stockPage} de {stockTotalPages} ({filteredProducts.length} resultados)</span>
              <button className="pagination-nav" disabled={stockPage === stockTotalPages} onClick={() => setStockPage(p => Math.min(stockTotalPages, p + 1))}>›</button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Movements */}
      {activeTab === 'movements' && (
        <div>
          <div className="clients-toolbar">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Buscar por producto..." value={movSearch} onChange={e => setMovSearch(e.target.value)} />
            </div>
            <div className="toolbar-filters">
              <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">Todos los tipos</option>
                <option value="IN">Entradas (IN)</option>
                <option value="OUT">Salidas (OUT)</option>
              </select>
            </div>
          </div>

          <div className="results-count">
            {filteredMovements.length} movimiento{filteredMovements.length !== 1 ? 's' : ''} {movSearch && `para "${movSearch}"`}
          </div>

          {filteredMovements.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div className="page-title" style={{ fontSize: 18 }}>Sin Movimientos</div>
              <p className="text-muted" style={{ marginTop: 8 }}>Aún no hay registros de ajustes de stock.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: 'center' }}>Cantidad</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMovements.map(mov => (
                      <tr key={mov.id}>
                        <td style={{ fontWeight: 600 }}>#{mov.id}</td>
                        <td className="text-muted">{new Date(mov.createdAt).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ fontWeight: 600 }}>{mov.productName}</td>
                        <td>
                          <span className={`badge ${mov.type === 'IN' ? 'badge-green' : 'badge-rose'}`}>
                            {mov.type === 'IN' ? '⬇ Entrada' : '⬆ Salida'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: mov.type === 'IN' ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                          {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                        </td>
                        <td className="text-muted">{mov.reason || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {movTotalPages > 1 && (
            <div className="pagination">
              <button className="pagination-nav" disabled={movPage === 1} onClick={() => setMovPage(p => Math.max(1, p - 1))}>‹</button>
              <span className="pagination-info">Pág. {movPage} de {movTotalPages} ({filteredMovements.length} resultados)</span>
              <button className="pagination-nav" disabled={movPage === movTotalPages} onClick={() => setMovPage(p => Math.min(movTotalPages, p + 1))}>›</button>
            </div>
          )}
        </div>
      )}

      {showAdjustModal && (
        <AdjustStockModal
          onClose={handleModalClose}
          onSave={handleModalSave}
          preselectedProduct={selectedProduct}
        />
      )}
    </div>
  );
}
