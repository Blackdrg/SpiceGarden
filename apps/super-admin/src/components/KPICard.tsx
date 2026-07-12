import styles from './KPICard.module.css';
import type { CSSProperties, ReactNode } from 'react';

const accentColors: Record<string, { deltaClass: string; accent: string }> = {
  '#10B981': { deltaClass: styles.deltaSuccess, accent: '#10B981' },
  '#3B82F6': { deltaClass: styles.deltaInfo, accent: '#3B82F6' },
  '#F59E0B': { deltaClass: styles.deltaWarning, accent: '#F59E0B' },
  '#EF4444': { deltaClass: styles.deltaDanger, accent: '#EF4444' },
  '#8B5CF6': { deltaClass: styles.deltaInfo, accent: '#8B5CF6' },
};

export function KPICard({ label, value, upColor, delta, icon }: { label: string; value: string; upColor?: string; delta?: string; icon?: ReactNode }) {
  const accentInfo = upColor ? accentColors[upColor] : null;
  const accentStyle = upColor ? { '--kpi-accent': upColor } as CSSProperties : undefined;
  const deltaClass = accentInfo?.deltaClass || '';

  return (
    <div className={styles.card} style={accentStyle}>
      {icon && <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>{icon}</div>}
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {delta && <div className={`${styles.delta} ${deltaClass}`}>{delta}</div>}
    </div>
  );
}
