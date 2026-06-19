import React, { useState, useEffect } from 'react';
import { fetchProducts, createInventoryMovement } from '../api/apiClient';
import { useToast } from './Toast';

export default function AdjustStockModal({ onClose, onSave, preselectedProduct = null }) {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [productId, setProductId] = useState(preselectedProduct?.id || '');
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        toast('Error al cargar productos', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!productId || quantity <= 0) return;

    try {
      await createInventoryMovement({
        productId: parseInt(productId),
        type,
        quantity: parseInt(quantity),
        reason
      });
      onSave();
    } catch (err) {
      console.error(err);
      toast('Error al registrar el movimiento. Verifique si hay stock suficiente en caso de salida.', 'error');
    }
  }

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal" style={{ padding: 40, textAlign: 'center' }}>Cargando productos...</div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">📦 Ajustar Stock</h2>
          <button type="button" className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Producto *</label>
              <select className="form-select" value={productId} onChange={e => setProductId(e.target.value)} required>
                <option value="">Seleccione un producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Movimiento *</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="IN">Entrada (Sumar Stock)</option>
                  <option value="OUT">Salida (Restar Stock)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cantidad *</label>
                <input className="form-input" type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo (Opcional)</label>
              <input className="form-input" type="text" placeholder="Ej. Compra, Merma, Ajuste" value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">✅ Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
