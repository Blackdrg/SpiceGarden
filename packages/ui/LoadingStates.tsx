"use client";

import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';
import { Skeleton } from './Skeleton';

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
        padding: DESIGN_TOKENS.spacing[10],
        textAlign: 'center',
        minHeight: 240,
        ...style,
      }}
      role="status"
      aria-live="polite"
    >
      {icon && <div style={{ marginBottom: DESIGN_TOKENS.spacing[5], opacity: 0.8 }}>{icon}</div>}
      <h3 style={{
        margin: 0,
        marginBottom: DESIGN_TOKENS.spacing[3],
        color: DESIGN_TOKENS.colors.textPrimary,
        ...DESIGN_TOKENS.typography.headingS,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          margin: 0,
          color: DESIGN_TOKENS.colors.textSecondary,
          ...DESIGN_TOKENS.typography.bodySmall,
          maxWidth: 360,
        }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: DESIGN_TOKENS.spacing[6],
            padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[6]}px`,
            backgroundColor: DESIGN_TOKENS.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: DESIGN_TOKENS.radius.lg,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: `all ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
            minHeight: 40,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.primaryHover;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.primary;
            e.currentTarget.style.transform = 'translateY(0)';
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
        padding: DESIGN_TOKENS.spacing[10],
        textAlign: 'center',
        minHeight: 240,
        backgroundColor: DESIGN_TOKENS.colors.elevated,
        borderRadius: DESIGN_TOKENS.radius.xl,
        border: `1px solid ${DESIGN_TOKENS.colors.borderLight}`,
        margin: DESIGN_TOKENS.spacing[4],
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: DESIGN_TOKENS.radius.full,
        backgroundColor: DESIGN_TOKENS.colors.dangerLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: DESIGN_TOKENS.spacing[4],
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DESIGN_TOKENS.colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M2 8.82a15 15 0 0 1 20 0" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </div>
      <h3 style={{
        margin: 0,
        marginBottom: DESIGN_TOKENS.spacing[3],
        color: DESIGN_TOKENS.colors.textPrimary,
        ...DESIGN_TOKENS.typography.headingS,
      }}>
        Connection Lost
      </h3>
      <p style={{
        margin: 0,
        color: DESIGN_TOKENS.colors.textSecondary,
        ...DESIGN_TOKENS.typography.bodySmall,
        marginBottom: DESIGN_TOKENS.spacing[5],
        maxWidth: 320,
      }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[6]}px`,
            backgroundColor: DESIGN_TOKENS.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: DESIGN_TOKENS.radius.lg,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: `all ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
            minHeight: 40,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.primaryHover;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.primary;
            e.currentTarget.style.transform = 'translateY(0)';
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
  label?: string;
}

export const LoadingState = ({ count = 3, variant = 'card', label }: LoadingStateProps) => {
  if (variant === 'text') {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing[4], display: 'flex', flexDirection: 'column', alignItems: 'center', gap: DESIGN_TOKENS.spacing[3] }}>
        {label && <p style={{ ...DESIGN_TOKENS.typography.bodySmall, color: DESIGN_TOKENS.colors.textSecondary }}>{label}</p>}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 16,
              backgroundColor: DESIGN_TOKENS.colors.elevated,
              borderRadius: DESIGN_TOKENS.radius.sm,
              width: `${Math.max(40, Math.min(100 - i * 8, 100))}%`,
              animation: 'sg-pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing[4], display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing[2] }}>
        {label && <p style={{ ...DESIGN_TOKENS.typography.bodySmall, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing[2] }}>{label}</p>}
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[3] }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: DESIGN_TOKENS.radius.full,
                backgroundColor: DESIGN_TOKENS.colors.elevated,
                animation: 'sg-pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
            <div
              style={{
                height: 14,
                backgroundColor: DESIGN_TOKENS.colors.elevated,
                borderRadius: DESIGN_TOKENS.radius.sm,
                flex: 1,
                animation: 'sg-pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1 + 0.05}s`,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing[4] }}>
      {label && <p style={{ ...DESIGN_TOKENS.typography.bodySmall, color: DESIGN_TOKENS.colors.textSecondary }}>{label}</p>}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${DESIGN_TOKENS.colors.borderLight}`,
            borderRadius: DESIGN_TOKENS.radius.xl,
            padding: DESIGN_TOKENS.spacing[5],
            backgroundColor: DESIGN_TOKENS.colors.surface,
            animation: 'sg-pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing[4], alignItems: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: DESIGN_TOKENS.radius.full,
                backgroundColor: DESIGN_TOKENS.colors.elevated,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ height: 16, backgroundColor: DESIGN_TOKENS.colors.elevated, marginBottom: 8, width: '70%', borderRadius: DESIGN_TOKENS.radius.sm }} />
              <div style={{ height: 14, backgroundColor: DESIGN_TOKENS.colors.elevated, width: '40%', borderRadius: DESIGN_TOKENS.radius.sm }} />
            </div>
          </div>
          <div style={{ height: 12, backgroundColor: DESIGN_TOKENS.colors.elevated, marginTop: DESIGN_TOKENS.spacing[4], borderRadius: DESIGN_TOKENS.radius.sm }} />
          <div style={{ height: 12, backgroundColor: DESIGN_TOKENS.colors.elevated, width: '80%', marginTop: 6, borderRadius: DESIGN_TOKENS.radius.sm }} />
          <div style={{ height: 12, backgroundColor: DESIGN_TOKENS.colors.elevated, width: '60%', marginTop: 6, borderRadius: DESIGN_TOKENS.radius.sm }} />
        </div>
      ))}
    </div>
  );
};

const pulseStyle = `
  @keyframes sg-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('loading-styles')) {
  const style = document.createElement('style');
  style.id = 'loading-styles';
  style.textContent = pulseStyle;
  document.head.appendChild(style);
}
