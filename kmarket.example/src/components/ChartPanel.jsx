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

  return (
    <div className="chart-panel" style={{ borderColor: `${color}40` }}>
      <div className="chart-panel-header">
        <div className="chart-panel-title">
          <div className="chart-panel-dot" style={{ background: color }} />
          <span>{label}</span>
        </div>
        <div className="chart-panel-controls">
          <select value={chartType} onChange={e => setChartType(e.target.value)} className="chart-select">
            <option value="area">Área</option>
            <option value="line">Línea</option>
            <option value="bar">Barras</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="chart-select">
            <option value="days">Días</option>
            <option value="weeks">Semanas</option>
            <option value="months">Meses</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="chart-empty">Error al cargar los datos</div>
      ) : loading ? (
        <div className="chart-loading">
          <div className="chart-spinner" style={{ borderTopColor: color }} />
          Cargando datos...
        </div>
      ) : (
        <AreaChart data={data} color={color} type={chartType} isMoney={isMoney} />
      )}
    </div>
  );
}
