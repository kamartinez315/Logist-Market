import React from 'react';
import { AreaChart as RechartsArea, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fmt = (v, isMoney) => {
  if (!isMoney) return v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
};

function CustomTooltip({ active, payload, label, isMoney }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: payload[0].color, fontWeight: 700 }}>{fmt(payload[0].value, isMoney)}</div>
    </div>
  );
}

export default function AreaChart({ data = [], color = '#22c55e', type = 'area', isMoney = true }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        Sin datos disponibles para este período
      </div>
    );
  }

  const ChartComp = type === 'area' ? RechartsArea : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmt(v, isMoney)}
            />
            <Tooltip content={<CustomTooltip isMoney={isMoney} />} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        ) : (
          <ChartComp data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmt(v, isMoney)}
            />
            <Tooltip content={<CustomTooltip isMoney={isMoney} />} />
            <DataComponent
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.15}
              dot={{ r: 4, fill: '#fff', stroke: color, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </ChartComp>
        )}
      </ResponsiveContainer>
    </div>
  );
}
