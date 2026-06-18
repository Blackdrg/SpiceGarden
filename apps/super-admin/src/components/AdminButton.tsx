import type { CSSProperties } from 'react';

const buttonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  color: 'white',
};

const buttonBackgrounds: Record<string, string> = {
  primary: '#f04e31',
  secondary: '#f0f0f0',
  danger: '#ff4444',
  info: '#2196f3',
};

export function AdminButton({ label, onClick, style, variant = 'primary', ...rest }: {
  label: string;
  onClick: () => void;
  style?: CSSProperties;
  variant?: 'primary' | 'secondary' | 'danger';
} & Record<string, unknown>) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...buttonStyle,
        background: buttonBackgrounds[variant] || buttonBackgrounds.info,
        ...style,
      }}
      {...rest}
    >
      {label}
    </button>
  );
}
