import type { CSSProperties } from 'react';
import styles from './DashboardCard.module.css';

const buttonBackgrounds: Record<string, string> = {
  primary: '#FF5A1F',
  secondary: '#FFFFFF',
  danger: '#EF4444',
  info: '#3B82F6',
};

export function AdminButton({ label, onClick, style, variant = 'primary', ...rest }: {
  label: string;
  onClick: () => void;
  style?: CSSProperties;
  variant?: 'primary' | 'secondary' | 'danger' | 'info';
} & Record<string, unknown>) {
  const baseStyle: CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    border: variant === 'secondary' ? '1px solid #E5E7EB' : 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: variant === 'secondary' ? '#374151' : '#FFFFFF',
    background: buttonBackgrounds[variant] || '#3B82F6',
    fontFamily: 'inherit',
    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...baseStyle, ...style }}
      {...rest}
    >
      {label}
    </button>
  );
}
