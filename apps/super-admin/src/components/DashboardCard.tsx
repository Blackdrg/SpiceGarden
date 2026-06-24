import type { CSSProperties, ReactNode } from 'react';

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 20,
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
};

const cardTitleStyle: CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: 17,
  fontWeight: 700,
};

const cardSubStyle: CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: 13,
  color: '#888',
};

export function DashboardCard({ title, sub, children, style }: { title: string; sub?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      {title && <h3 style={cardTitleStyle}>{title}</h3>}
      {sub && <p style={cardSubStyle}>{sub}</p>}
      {children}
    </div>
  );
}
