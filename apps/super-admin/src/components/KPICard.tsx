import type { CSSProperties } from 'react';

const kpiCardStyle: CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 18,
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
};

const kpiLabelStyle: CSSProperties = {
  fontSize: 12,
  color: '#888',
  fontWeight: 500,
  textTransform: 'uppercase',
  marginBottom: 8,
};

const kpiValueStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: '#1a1a2e',
};

export function KPICard({ label, value, upColor, delta }: { label: string; value: string; upColor?: string; delta?: string }) {
  return (
    <div style={kpiCardStyle}>
      <div style={kpiLabelStyle}>{label}</div>
      <div style={kpiValueStyle}>{value}</div>
      {delta && <div style={{ fontSize: 12, color: upColor || '#888', marginTop: 4, fontWeight: 500 }}>↑ {delta}</div>}
    </div>
  );
}
