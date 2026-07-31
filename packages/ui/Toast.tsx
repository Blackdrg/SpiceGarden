"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="10" cy="10" r="10" fill={DESIGN_TOKENS.colors.successLight} />
          <path d="M6.5 10.5L9 13L13.5 7.5" stroke={DESIGN_TOKENS.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'error':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="10" cy="10" r="10" fill={DESIGN_TOKENS.colors.dangerLight} />
          <path d="M7 7L13 13M13 7L7 13" stroke={DESIGN_TOKENS.colors.danger} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'warning':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="10" cy="10" r="10" fill={DESIGN_TOKENS.colors.warningLight} />
          <path d="M10 7V11M10 14V14.5" stroke={DESIGN_TOKENS.colors.warning} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="10" cy="10" r="10" fill={DESIGN_TOKENS.colors.infoLight} />
          <path d="M10 7V10M10 13.5V14" stroke={DESIGN_TOKENS.colors.info} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    const duration = toast.duration ?? 4000;
    const newToast: Toast = { ...toast, id, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div style={{
        position: 'fixed',
        top: DESIGN_TOKENS.spacing[5],
        right: DESIGN_TOKENS.spacing[5],
        zIndex: DESIGN_TOKENS.zIndex.toast,
        display: 'flex',
        flexDirection: 'column',
        gap: DESIGN_TOKENS.spacing[3],
        maxWidth: 420,
        width: 'calc(100% - 40px)',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: DESIGN_TOKENS.spacing[3],
              padding: `${DESIGN_TOKENS.spacing[4]}px ${DESIGN_TOKENS.spacing[5]}px`,
              borderRadius: DESIGN_TOKENS.radius.lg,
              backgroundColor: DESIGN_TOKENS.colors.surface,
              border: `1px solid ${DESIGN_TOKENS.colors.border}`,
              boxShadow: DESIGN_TOKENS.shadows.large,
              animation: `sg-toast-in ${DESIGN_TOKENS.motion.standard}ms ${MOTION_EASING.easeOutSoft}`,
              pointerEvents: 'auto',
            }}
          >
            <ToastIcon type={toast.type} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                ...DESIGN_TOKENS.typography.bodySmall,
                color: DESIGN_TOKENS.colors.textPrimary,
                display: 'block',
              }}>
                {toast.message}
              </span>
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={toast.onAction}
                  style={{
                    marginTop: DESIGN_TOKENS.spacing[2],
                    padding: `${DESIGN_TOKENS.spacing[1]}px ${DESIGN_TOKENS.spacing[3]}px`,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: DESIGN_TOKENS.radius.sm,
                    background: DESIGN_TOKENS.colors.primary,
                    color: 'white',
                    cursor: 'pointer',
                    transition: `background ${DESIGN_TOKENS.motion.micro}ms`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = DESIGN_TOKENS.colors.primaryHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = DESIGN_TOKENS.colors.primary; }}
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => hideToast(toast.id)}
              aria-label="Dismiss notification"
              style={{
                border: 'none',
                background: 'transparent',
                color: DESIGN_TOKENS.colors.textTertiary,
                cursor: 'pointer',
                fontSize: 18,
                padding: 2,
                lineHeight: 1,
                borderRadius: DESIGN_TOKENS.radius.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: `color ${DESIGN_TOKENS.motion.micro}ms`,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = DESIGN_TOKENS.colors.textSecondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = DESIGN_TOKENS.colors.textTertiary; }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const bgColors: Record<ToastType, string> = {
  success: DESIGN_TOKENS.colors.successLight,
  error: DESIGN_TOKENS.colors.dangerLight,
  warning: DESIGN_TOKENS.colors.warningLight,
  info: DESIGN_TOKENS.colors.infoLight,
};

const borderColors: Record<ToastType, string> = {
  success: DESIGN_TOKENS.colors.success,
  error: DESIGN_TOKENS.colors.danger,
  warning: DESIGN_TOKENS.colors.warning,
  info: DESIGN_TOKENS.colors.info,
};

export const InlineAlert = ({
  type = 'info',
  message,
  onClose,
}: {
  type?: ToastType;
  message: string;
  onClose?: () => void;
}) => {

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing[3],
      padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[4]}px`,
      borderRadius: DESIGN_TOKENS.radius.lg,
      backgroundColor: bgColors[type],
      border: `1px solid ${borderColors[type]}33`,
    }}>
      <ToastIcon type={type} />
      <span style={{
        ...DESIGN_TOKENS.typography.bodySmall,
        flex: 1,
        color: DESIGN_TOKENS.colors.textPrimary,
      }}>
        {message}
      </span>
      {onClose && (
      <button
        type="button"
        onClick={onClose}
          aria-label="Close alert"
          style={{
            border: 'none',
            background: 'transparent',
            color: DESIGN_TOKENS.colors.textTertiary,
            cursor: 'pointer',
            fontSize: 18,
            padding: 2,
            lineHeight: 1,
            borderRadius: DESIGN_TOKENS.radius.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `color ${DESIGN_TOKENS.motion.micro}ms`,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = DESIGN_TOKENS.colors.textSecondary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = DESIGN_TOKENS.colors.textTertiary; }}
        >
          ×
        </button>
      )}
    </div>
  );
};
