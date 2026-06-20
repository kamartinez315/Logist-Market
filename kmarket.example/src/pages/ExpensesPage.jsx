import React, { useState, useEffect, useMemo } from 'react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense, fetchExpenseTimeseries, fetchDashboardStats, fetchTimeseries } from '../api/apiClient';
import ChartPanel from '../components/ChartPanel';
import { useToast } from '../components/Toast';
import { Edit2, Plus, Save, Check, X, DollarSign } from 'lucide-react';

function ExpenseModal({ expense, onClose, onSave, categories }) {
  const isEdit = !!expense?.id;
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(
    expense || {
      description: '', amount: 0, date: today, category: 'General', notes: ''
    }
  );
  const [isNewCategory, setIsNewCategory] = useState(
    expense && !(categories || []).includes(expense.category)
  );
  const [newCategoryName, setNewCategoryName] = useState(
    expense && !(categories || []).includes(expense.category) ? expense.category : ''
  );

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim()) return;
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onSave({
      ...form,
      amount: parseFloat(form.amount),
    });
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{isEdit ? <Edit2 size={18} /> : <Plus size={18} />}{isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <button type="button" className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Descripción *</label>
              <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Publicidad FB, Combustible, Luz..." required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Monto ($) *</label>
                <input className="form-input" type="number" step="0.01" min="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!isNewCategory ? (
                  <>
                    <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)} style={{ flex: 1 }}>
                      <option value="">Seleccionar categoría...</option>
                      {(categories || []).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button type="button" className="btn-icon" onClick={() => { setIsNewCategory(true); setNewCategoryName(''); set('category', ''); }} title="Nueva categoría">+</button>
                  </>
                ) : (
                  <>
                    <input className="form-input" value={newCategoryName} onChange={e => { setNewCategoryName(e.target.value); set('category', e.target.value); }} placeholder="Escribe nueva categoría..." style={{ flex: 1 }} autoFocus />
                    <button type="button" className="btn-icon" onClick={() => { setIsNewCategory(false); if (!newCategoryName) set('category', categories?.[0] || ''); }} title="Cancelar">✕</button>
                  </>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <textarea className="form-input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Detalles adicionales..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{isEdit ? <Save size={15} /> : <Check size={15} />}{isEdit ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpenseDetail({ expense, onClose, onEdit }) {
  if (!expense) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Detalle de Gasto</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="client-detail-header" style={{ padding: '24px' }}>
          <div className="avatar avatar-lg" style={{ background: '#f59e0b', color: '#fff' }}><DollarSign size={22} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{expense.description}</div>
            <span className="badge badge-yellow">${parseFloat(expense.amount).toFixed(2)}</span>
          </div>
        </div>
        <div className="client-stats-grid" style={{ padding: '0 24px' }}>
          <div className="client-stat">
            <div className="client-stat-value">{new Date(expense.date).toLocaleDateString('es-DO')}</div>
            <div className="client-stat-label">Fecha</div>
          </div>
          <div className="client-stat">
            <div className="client-stat-value">${parseFloat(expense.amount).toFixed(2)}</div>
            <div className="client-stat-label">Monto</div>
          </div>
        </div>
        {expense.notes && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <div className="client-stat-label" style={{ marginBottom: 4 }}>Notas</div>
            <div className="text-muted">{expense.notes}</div>
          </div>
        )}
        <div className="modal-footer" style={{ marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => onEdit(expense)}>✏️ Editar</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({ expense, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">🗑️ Eliminar Gasto</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <p style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
          ¿Estás seguro de que deseas eliminar el gasto <strong>{expense?.description}</strong> por <strong>${parseFloat(expense?.amount || 0).toFixed(2)}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [chartCategory, setChartCategory] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeMarginChart, setActiveMarginChart] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      setLoading(true);
      const [data, dashStats] = await Promise.all([
        fetchExpenses(),
        fetchDashboardStats()
      ]);
      setExpenses(data);
      setTotalRevenue(dashStats.totalRevenue);
    } catch (err) {
      console.error(err);
      toast('Error al cargar gastos', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = expenses.filter(e => {
      const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
      let matchMonth = true;
      if (monthFilter !== 'all') {
        const expenseMonth = new Date(e.date).getMonth();
        const expenseYear = new Date(e.date).getFullYear();
        const [filterYear, filterMonth] = monthFilter.split('-').map(Number);
        matchMonth = expenseMonth === filterMonth - 1 && expenseYear === filterYear;
      }
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      return matchSearch && matchMonth && matchCat;
    });
    return list;
  }, [expenses, search, monthFilter, categoryFilter]);

  const totalAmount = useMemo(() => {
    return filtered.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  }, [filtered]);

  const margenPerdida = useMemo(() => {
    return totalRevenue > 0 ? (totalAmount / totalRevenue) * 100 : 0;
  }, [totalAmount, totalRevenue]);

  const monthOptions = useMemo(() => {
    const options = new Set();
    expenses.forEach(e => {
      const d = new Date(e.date);
      options.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(options).sort().reverse();
  }, [expenses]);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [expenses]);

  const modalCategories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category).filter(Boolean));
    return Array.from(cats);
  }, [expenses]);

  function openDetail(e) { setSelected(e); setModal('detail'); }
  function openEdit(e)   { setSelected(e); setModal('edit'); }
  function openDelete(e) { setSelected(e); setModal('delete'); }
  function closeModal()  { setModal(null); setSelected(null); }

  async function handleSave(data) {
    try {
      if (data.id) {
        await updateExpense(data.id, data);
      } else {
        await createExpense(data);
      }
      await loadExpenses();
      closeModal();
    } catch (err) {
      console.error(err);
      toast('Error al guardar el gasto', 'error');
    }
  }

  async function handleDelete() {
    try {
      if (selected?.id) {
        await deleteExpense(selected.id);
        await loadExpenses();
      }
      closeModal();
    } catch (err) {
      console.error(err);
      toast('Error al eliminar el gasto', 'error');
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando gastos...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos Operativos</h1>
          <p className="page-subtitle">{expenses.length} gastos registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>＋ Nuevo Gasto</button>
      </div>

      <div className="clients-summary">
        <div className="summary-chip" onClick={() => setActiveChart(prev => !prev)} style={{ cursor: 'pointer', borderColor: activeChart ? '#ef4444' : undefined, boxShadow: activeChart ? '0 0 0 2px #ef444430, var(--shadow-sm)' : undefined, transition: 'all 0.18s ease', position: 'relative', overflow: 'hidden' }}>
          {activeChart && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#ef4444', borderRadius: '0 0 var(--radius) var(--radius)' }} />}
          <span className="summary-chip-icon" style={{ background: '#ef444422', color: '#ef4444' }}>$</span>
          <div>
            <div className="summary-chip-value">${totalAmount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="summary-chip-label">Total Gastado</div>
          </div>
          <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 10, color: activeChart ? '#ef4444' : 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.03em', opacity: activeChart ? 1 : 0.6 }}>
            {activeChart ? '▲ ocultar' : '▼ ver gráfica'}
          </div>
        </div>
        <div className="summary-chip">
          <span className="summary-chip-icon" style={{ background: '#3b82f622', color: '#3b82f6' }}>#</span>
          <div>
            <div className="summary-chip-value">{filtered.length}</div>
            <div className="summary-chip-label">Gastos</div>
          </div>
        </div>
        <div className="summary-chip" onClick={() => setActiveMarginChart(prev => !prev)} style={{ cursor: 'pointer', borderColor: activeMarginChart ? '#a1064e' : undefined, boxShadow: activeMarginChart ? '0 0 0 2px #a1064e30, var(--shadow-sm)' : undefined, transition: 'all 0.18s ease', position: 'relative', overflow: 'hidden' }}>
          {activeMarginChart && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#a1064e', borderRadius: '0 0 var(--radius) var(--radius)' }} />}
          <span className="summary-chip-icon" style={{ background: '#a1064e22', color: '#a1064e' }}>%</span>
          <div>
            <div className="summary-chip-value">{margenPerdida.toFixed(2)}%</div>
            <div className="summary-chip-label">Margen de Pérdida</div>
          </div>
          <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 10, color: activeMarginChart ? '#a1064e' : 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.03em', opacity: activeMarginChart ? 1 : 0.6 }}>
            {activeMarginChart ? '▲ ocultar' : '▼ ver gráfica'}
          </div>
        </div>
      </div>

      {(activeChart || activeMarginChart) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Categoría:</label>
          <select className="form-select" value={chartCategory} onChange={e => setChartCategory(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="">Todas las categorías</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {activeChart && (
        <ChartPanel
          label="Total Gastado"
          color="#ef4444"
          isMoney
          fetchData={(period) => fetchExpenseTimeseries(period, chartCategory)}
        />
      )}

      {activeMarginChart && (
        <ChartPanel
          label="Margen de Pérdida"
          color="#a1064e"
          isMoney={false}
          fetchData={async (period) => {
            const [expData, revData] = await Promise.all([
              fetchExpenseTimeseries(period, chartCategory),
              fetchTimeseries('revenue', period)
            ]);
            return expData.map((pt, i) => ({
              date: pt.date,
              value: revData[i]?.value > 0 ? (pt.value / revData[i].value) * 100 : 0
            }));
          }}
        />
      )}

      <div className="clients-toolbar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Buscar gasto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-filters">
          <select className="form-select" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
            <option value="all">Todos los meses</option>
            {monthOptions.map(m => {
              const [y, mo] = m.split('-');
              const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
              return <option key={m} value={m}>{months[parseInt(mo) - 1]} {y}</option>;
            })}
          </select>
          <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'Todas las categorías' : c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-count">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} {search && ` para "${search}"`}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div className="page-title" style={{ fontSize: 18 }}>Sin resultados</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                  <tr key={e.id} onClick={() => openDetail(e)} style={{ cursor: 'pointer' }}>
                    <td className="text-muted">{new Date(e.date).toLocaleDateString('es-DO')}</td>
                    <td style={{ fontWeight: 600 }}>{e.description}</td>
                    <td><span className="badge badge-indigo">{e.category || 'N/A'}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>${parseFloat(e.amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }} onClick={e2 => e2.stopPropagation()}>
                      <button className="btn-icon" onClick={() => openEdit(e)}>✏️</button>
                      <button className="btn-icon" style={{ color: 'var(--accent-rose)' }} onClick={() => openDelete(e)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && <ExpenseModal expense={modal === 'edit' ? selected : null} onClose={closeModal} onSave={handleSave} categories={modalCategories} />}
      {modal === 'detail' && <ExpenseDetail expense={selected} onClose={closeModal} onEdit={e => { setSelected(e); setModal('edit'); }} />}
      {modal === 'delete' && <ConfirmDelete expense={selected} onClose={closeModal} onConfirm={handleDelete} />}
    </div>
  );
}
