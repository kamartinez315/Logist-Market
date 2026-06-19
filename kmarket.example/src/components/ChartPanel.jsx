import React, { useState, useEffect, useRef } from 'react';
import AreaChart from './AreaChart';

export default function ChartPanel({ label, color, isMoney = true, fetchData }) {
  const [chartType, setChartType] = useState('area');
  const [period, setPeriod] = useState('days');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchRef = useRef(fetchData);
  fetchRef.current = fetchData;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchRef.current(period)
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [period]);

  const selectStyle = {
    border: '1px solid var(--border-color)', borderRadius: 6,
    padding: '5px 28px 5px 10px', fontSize: 13,
    color: 'var(--text-primary)', background: 'var(--bg-card)',
    cursor: 'pointer', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
    outline: 'none',
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${color}40`,
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      marginBottom: 20,
      animation: 'fadeSlideDown 0.22s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={chartType} onChange={e => setChartType(e.target.value)} style={selectStyle}>
            <option value="area">Área</option>
            <option value="line">Línea</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={selectStyle}>
            <option value="days">Días</option>
            <option value="weeks">Semanas</option>
            <option value="months">Meses</option>
          </select>
        </div>
      </div>

      {error ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)', fontSize: 13 }}>
          Error al cargar los datos
        </div>
      ) : loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 16, height: 16, border: `2px solid ${color}`,
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite'
            }} />
            Cargando datos...
          </div>
        </div>
      ) : (
        <AreaChart data={data} color={color} type={chartType} isMoney={isMoney} />
      )}
    </div>
  );
}
