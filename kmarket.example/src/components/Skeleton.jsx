import React from 'react';

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><div className="skeleton" style={{ height: 14, width: '60%' }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><div className="skeleton" style={{ height: 14, width: c === 0 ? '70%' : '40%' }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCards({ count = 3 }) {
  return (
    <div className="clients-summary">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="summary-chip" style={{ border: '1px solid var(--border-color)' }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '50%', height: 18, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: '70%', height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="skeleton" style={{ width: 200, height: 24, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 160, height: 14 }} />
        </div>
      </div>
      <SkeletonCards count={3} />
      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <div className="skeleton" style={{ width: '100%', height: 42 }} />
      </div>
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}
