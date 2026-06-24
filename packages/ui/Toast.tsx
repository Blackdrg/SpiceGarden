"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

type ToastType = 'success' | 'error' | 'info';

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

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
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

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: DESIGN_TOKENS.spacing.sm,
        maxWidth: 400,
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            style={{
              padding: `${DESIGN_TOKENS.spacing.lg}px`,
              borderRadius: DESIGN_TOKENS.radius.card,
              backgroundColor: toast.type === 'success' ? '#e8f5e8' :
                toast.type === 'error' ? '#fff5f5' : '#f0f0f5',
              borderLeft: `4px solid ${toast.type === 'success' ? DESIGN_TOKENS.colors.success :
                toast.type === 'error' ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.primary}`,
              boxShadow: DESIGN_TOKENS.shadows.medium,
              animation: `slideIn ${DESIGN_TOKENS.motion.standard}ms ${MOTION_EASING.easeOutSoft}`,
            }}
          >
            <span style={{
              ...DESIGN_TOKENS.typography.body,
              color: DESIGN_TOKENS.colors.textPrimary,
            }}>
              {toast.message}
            </span>
            {toast.actionLabel && toast.onAction && (
              <button
                onClick={toast.onAction}
                style={{
                  marginTop: DESIGN_TOKENS.spacing.sm,
                  padding: '4px 12px',
                  fontSize: 13,
                  border: 'none',
                  borderRadius: DESIGN_TOKENS.radius.sm,
                  background: toast.type === 'success' ? DESIGN_TOKENS.colors.success :
                    toast.type === 'error' ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.primary,
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
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
  const bgColor = type === 'success' ? '#e8f5e8' :
    type === 'error' ? '#fff5f5' : '#f0f0f5';
  const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';

  return (
    <div style={{
      padding: `${DESIGN_TOKENS.spacing.md}px`,
      borderRadius: DESIGN_TOKENS.radius.md,
      backgroundColor: bgColor,
      border: `1px solid ${type === 'success' ? DESIGN_TOKENS.colors.success :
        type === 'error' ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.primary}66`,
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing.sm,
    }}>
      <span style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: type === 'success' ? DESIGN_TOKENS.colors.success :
          type === 'error' ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.primary,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
      }}>
        {icon}
      </span>
      <span style={{
        ...DESIGN_TOKENS.typography.body,
        flex: 1,
        color: DESIGN_TOKENS.colors.textPrimary,
      }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close alert"
          style={{
            border: 'none',
            background: 'transparent',
            color: DESIGN_TOKENS.colors.textSecondary,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};