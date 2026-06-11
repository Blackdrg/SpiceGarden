import React from 'react';
import { DESIGN_TOKENS } from './tokens';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState = ({ title, description, icon, actionLabel, onAction, style }: EmptyStateProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: DESIGN_TOKENS.spacing.xl,
        textAlign: 'center',
        minHeight: '200px',
        ...style,
      }}
      role="status"
      aria-live="polite"
    >
      {icon && <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg, opacity: 0.5 }}>{icon}</div>}
      <h3 style={{ 
        margin: 0, 
        marginBottom: DESIGN_TOKENS.spacing.sm,
        color: DESIGN_TOKENS.colors.textPrimary,
        ...DESIGN_TOKENS.typography.headingS 
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ 
          margin: 0,
          color: DESIGN_TOKENS.colors.textSecondary,
          ...DESIGN_TOKENS.typography.body 
        }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: DESIGN_TOKENS.spacing.lg,
            padding: `${DESIGN_TOKENS.spacing.sm}px ${DESIGN_TOKENS.spacing.lg}px`,
            backgroundColor: DESIGN_TOKENS.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: DESIGN_TOKENS.radius.button,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkError = ({ onRetry, message = 'Unable to connect. Please check your internet connection.' }: NetworkErrorProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: DESIGN_TOKENS.spacing.xl,
        textAlign: 'center',
        minHeight: '200px',
        backgroundColor: DESIGN_TOKENS.colors.elevated,
        borderRadius: DESIGN_TOKENS.radius.card,
        margin: DESIGN_TOKENS.spacing.md,
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ fontSize: '48px', marginBottom: DESIGN_TOKENS.spacing.lg }}>📶</div>
      <h3 style={{ 
        margin: 0, 
        marginBottom: DESIGN_TOKENS.spacing.sm,
        color: DESIGN_TOKENS.colors.textPrimary 
      }}>
        Connection Lost
      </h3>
      <p style={{ 
        margin: 0,
        color: DESIGN_TOKENS.colors.textSecondary,
        marginBottom: DESIGN_TOKENS.spacing.lg 
      }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: `${DESIGN_TOKENS.spacing.sm}px ${DESIGN_TOKENS.spacing.xl}px`,
            backgroundColor: DESIGN_TOKENS.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: DESIGN_TOKENS.radius.md,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
          aria-label="Retry connection"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export interface LoadingStateProps {
  count?: number;
  variant?: 'card' | 'list' | 'text';
}

export const LoadingState = ({ count = 3, variant = 'card' }: LoadingStateProps) => {
  if (variant === 'text') {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '16px',
              backgroundColor: DESIGN_TOKENS.colors.elevated,
              borderRadius: DESIGN_TOKENS.radius.sm,
              marginBottom: DESIGN_TOKENS.spacing.xs,
              width: `${Math.random() * 40 + 60}%`,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.sm }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: DESIGN_TOKENS.colors.elevated,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                height: '14px',
                backgroundColor: DESIGN_TOKENS.colors.elevated,
                borderRadius: DESIGN_TOKENS.radius.sm,
                flex: 1,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            borderRadius: `${DESIGN_TOKENS.radius.card}px`,
            padding: `${DESIGN_TOKENS.spacing.lg}px`,
            backgroundColor: DESIGN_TOKENS.colors.surface,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, alignItems: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: DESIGN_TOKENS.colors.elevated,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ height: '16px', backgroundColor: DESIGN_TOKENS.colors.elevated, marginBottom: 8, width: '70%' }} />
              <div style={{ height: '14px', backgroundColor: DESIGN_TOKENS.colors.elevated, width: '40%' }} />
            </div>
          </div>
          <div style={{ height: '12px', backgroundColor: DESIGN_TOKENS.colors.elevated, marginTop: DESIGN_TOKENS.spacing.md }} />
          <div style={{ height: '12px', backgroundColor: DESIGN_TOKENS.colors.elevated, width: '80%', marginTop: 4 }} />
          <div style={{ height: '12px', backgroundColor: DESIGN_TOKENS.colors.elevated, width: '60%', marginTop: 4 }} />
        </div>
      ))}
    </div>
  );
};

const pulseStyle = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('loading-styles')) {
  const style = document.createElement('style');
  style.id = 'loading-styles';
  style.textContent = pulseStyle;
  document.head.appendChild(style);
}