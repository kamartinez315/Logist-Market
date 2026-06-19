import React, { useState } from 'react';

export default function AreaChart({ data = [], color = '#22c55e', type = 'area', isMoney = true }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        Sin datos disponibles para este período
      </div>
    );
  }

  const W = 1000, H = 220;
  const ML = 82, MR = 16, MT = 16, MB = 48;
  const chartW = W - ML - MR;
  const chartH = H - MT - MB;
  const n = data.length;

  const values = data.map(d => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const isAllZero = rawMin === 0 && rawMax === 0;

  const pad = isAllZero ? 0 : (rawMax - rawMin) * 0.12 || 1;
  const yMin = rawMin >= 0 ? 0 : rawMin - pad;
  const yMax = isAllZero ? (isMoney ? 100 : 10) : rawMax + pad;
  const yRange = yMax - yMin || 1;

  const xAt = (i) => ML + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const yAt = (v) => MT + chartH - ((v - yMin) / yRange) * chartH;

  const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value) }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const areaPath =
    `M${pts[0].x.toFixed(2)},${(MT + chartH).toFixed(2)}` +
    pts.map(p => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') +
    `L${pts[pts.length - 1].x.toFixed(2)},${(MT + chartH).toFixed(2)}Z`;

  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const v = yMin + (yRange / (tickCount - 1)) * i;
    return { v, y: yAt(v) };
  });

  const step = Math.max(1, Math.ceil(n / 10));
  const xIndices = new Set([0, n - 1]);
  for (let i = step; i < n - 1; i += step) xIndices.add(i);

  const fmt = (v) => {
    if (!isMoney) return v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
    return `$${v.toFixed(0)}`;
  };

  const gradId = `tsg-${color.replace('#', '')}`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 200, display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={ML} y1={t.y.toFixed(2)} x2={W - MR} y2={t.y.toFixed(2)}
              stroke="#e5e7eb" strokeWidth="1" />
            <text x={ML - 8} y={(t.y + 4).toFixed(2)}
              textAnchor="end" fontSize="11" fill="#9ca3af">
              {fmt(t.v)}
            </text>
          </g>
        ))}

        {yMin < 0 && yMax > 0 && (
          <line x1={ML} y1={yAt(0).toFixed(2)} x2={W - MR} y2={yAt(0).toFixed(2)}
            stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="4 3" />
        )}

        {type === 'area' && <path d={areaPath} fill={`url(#${gradId})`} />}

        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r="4.5"
            fill="#fff" stroke={color} strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => setTooltip({ x: p.x, y: p.y, date: data[i].date, value: data[i].value })}
          />
        ))}

        {[...xIndices].map(i => (
          <text key={i} x={pts[i].x.toFixed(2)} y={(H - 10).toFixed(2)}
            textAnchor="middle" fontSize="10.5" fill="#9ca3af">
            {data[i].date}
          </text>
        ))}

        {tooltip && (() => {
          const right = tooltip.x > W * 0.65;
          const tx = right ? tooltip.x - 98 : tooltip.x + 10;
          return (
            <g>
              <line x1={tooltip.x} y1={MT} x2={tooltip.x} y2={MT + chartH}
                stroke={color} strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5" />
              <rect x={tx} y={tooltip.y - 36} width="88" height="34"
                rx="6" fill="white" stroke={color} strokeWidth="1" strokeOpacity="0.3"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.13))' }} />
              <text x={tx + 44} y={(tooltip.y - 22).toFixed(2)}
                textAnchor="middle" fontSize="10" fill="#6b7280">{tooltip.date}</text>
              <text x={tx + 44} y={(tooltip.y - 8).toFixed(2)}
                textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
                {isMoney ? `$${tooltip.value.toFixed(2)}` : tooltip.value.toFixed(0)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
