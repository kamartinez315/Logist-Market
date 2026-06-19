import React, { useState, useEffect } from 'react';
import { fetchClients, fetchProducts, createSale } from '../api/apiClient';
import { useToast } from './Toast';

export default function NewSaleModal({ onClose, onSave }) {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedClient, setSelectedClient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [items, setItems] = useState([]);
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saleDate, setSaleDate] = useState('');
  const [dateText, setDateText] = useState('');
  const [errors, setErrors] = useState({});

  function formatDateInput(value) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  }

  function isValidDate(dd, mm, yyyy) {
    if (mm < 1 || mm > 12) return false;
    const daysInMonth = new Date(yyyy, mm, 0).getDate();
    if (dd < 1 || dd > daysInMonth) return false;
    return true;
  }

  function handleDateInput(e) {
    const formatted = formatDateInput(e.target.value);
    setDateText(formatted);
    if (formatted.length === 10) {
      const [d, m, y] = formatted.split('/').map(Number);
      if (isValidDate(d, m, y)) {
        const iso = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        setSaleDate(iso);
      } else {
        setSaleDate('');
      }
    } else {
      setSaleDate('');
    }
  }

  function handleClearDate() {
    setDateText('');
    setSaleDate('');
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [cData, pData] = await Promise.all([fetchClients(), fetchProducts()]);
        setClients(cData);
        setProducts(pData);
      } catch (err) {
        console.error(err);
        toast('Error al cargar datos para la venta', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);

  function addItem() {
    if (!selectedProduct) return;
    const prod = products.find(p => p.id === parseInt(selectedProduct));
    if (!prod) return;

    if (quantity <= 0) {
      setErrors(prev => ({ ...prev, quantity: 'La cantidad debe ser mayor a 0' }));
      return;
    }
    if (quantity > prod.stock) {
      setErrors(prev => ({ ...prev, quantity: `Stock insuficiente. Solo hay ${prod.stock} disponibles.` }));
      return;
    }

    const existing = items.find(i => i.productId === prod.id);
    if (existing) {
      if (existing.quantity + quantity > prod.stock) {
        setErrors(prev => ({ ...prev, quantity: `Stock insuficiente. Solo hay ${prod.stock} disponibles en total.` }));
        return;
      }
      setItems(items.map(i => i.productId === prod.id ? {
        ...i,
        quantity: i.quantity + quantity,
        subtotal: (i.quantity + quantity) * i.unitPrice
      } : i));
    } else {
      setItems([...items, {
        productId: prod.id,
        name: prod.name,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(prod.price),
        subtotal: parseInt(quantity) * parseFloat(prod.price)
      }]);
    }

    setSelectedProduct('');
    setQuantity(1);
  }

  function removeItem(productId) {
    setItems(items.filter(i => i.productId !== productId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) {
      setErrors(prev => ({ ...prev, cart: 'Debe agregar al menos un producto a la venta.' }));
      return;
    }

    try {
      const saleData = {
        clientId: selectedClient ? parseInt(selectedClient) : null,
        totalAmount,
        paymentMethod,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal
        })),
        saleDate: saleDate || null
      };

      await createSale(saleData);
      onSave();
    } catch (err) {
      console.error(err);
      toast('Error al procesar la venta', 'error');
    }
  }

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal" style={{ padding: 40, textAlign: 'center' }}>Cargando datos...</div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <h2 className="modal-title">🧾 Nueva Venta</h2>
          <button type="button" className="btn-icon" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, padding: 24 }}>
          {/* Left Column: Products selection */}
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Agregar Productos</h3>
            <div className="form-row" style={{ alignItems: 'flex-end', marginBottom: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Producto</label>
                <select className="form-select" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                  <option value="">Seleccione un producto...</option>
                  {products.filter(p => p.stock > 0).map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${parseFloat(p.price).toFixed(2)} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ width: 80 }}>
                <label className="form-label">Cant.</label>
                <input className="form-input" type="number" min="1" value={quantity} onChange={e => { setErrors({}); setQuantity(Math.max(1, parseInt(e.target.value) || 1)); }} />
                {errors.quantity && <span style={{ color: 'var(--accent-rose)', fontSize: 11, marginTop: 2, display: 'block' }}>{errors.quantity}</span>}
              </div>
              <button type="button" className="btn btn-secondary" onClick={addItem} style={{ height: 42 }}>➕</button>
            </div>

            <div className="table-container" style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style={{ textAlign: 'right' }}>Precio</th>
                    <th style={{ textAlign: 'center' }}>Cant.</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No hay productos agregados</td></tr>
                  ) : items.map(item => (
                    <tr key={item.productId}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                      <td>
                        <button type="button" className="btn-icon" style={{ color: 'var(--accent-rose)', padding: 4 }} onClick={() => removeItem(item.productId)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {errors.cart && <span style={{ color: 'var(--accent-rose)', fontSize: 12, marginTop: 6, display: 'block' }}>{errors.cart}</span>}
            </div>
          </div>

          {/* Right Column: Sale Details and Payment */}
          <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 12 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>Detalles de Venta</h3>
            
            <div className="form-group">
              <label className="form-label">Cliente</label>
              <select className="form-select" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                <option value="">Consumidor Final</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Método de Pago</label>
              <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Venta (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="DD/MM/AAAA"
                  value={dateText}
                  onChange={handleDateInput}
                  maxLength={10}
                  style={{
                    paddingRight: 36,
                    borderColor: dateText.length === 10 && !saleDate ? '#ef4444' : undefined
                  }}
                />
                <span style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 16, color: 'var(--text-muted)', pointerEvents: 'none'
                }}>📅</span>
                {dateText && (
                  <span
                    onClick={handleClearDate}
                    style={{
                      position: 'absolute', right: 32, top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer', fontSize: 12, color: 'var(--accent-rose)',
                      lineHeight: 1, fontWeight: 600
                    }}
                  >
                    ✕
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
                <span>Total a Pagar:</span>
                <span style={{ color: 'var(--accent-green)' }}>${totalAmount.toFixed(2)}</span>
              </div>
              <button type="button" className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: 16 }} onClick={handleSubmit}>
                ✅ Procesar Venta
              </button>
              <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: 12, fontSize: 16, marginTop: 8 }} onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
