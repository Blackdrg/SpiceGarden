"use client";

import React, { useEffect } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidth = size === 'sm' ? 400 : size === 'lg' ? 700 : 500;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: `fadeIn ${DESIGN_TOKENS.motion.page}ms ${MOTION_EASING.easeInOut}`,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: DESIGN_TOKENS.colors.surface,
          borderRadius: DESIGN_TOKENS.radius.card,
          padding: DESIGN_TOKENS.spacing.lg,
          maxWidth,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: DESIGN_TOKENS.shadows.large,
          animation: `slideUp ${DESIGN_TOKENS.motion.page}ms ${MOTION_EASING.easeOutSoft}`,
        }}
      >
        {title && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: DESIGN_TOKENS.spacing.lg,
          }}>
            <h2 id="modal-title" style={{
              margin: 0,
              ...DESIGN_TOKENS.typography.headingM,
              color: DESIGN_TOKENS.colors.textPrimary,
            }}>
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: DESIGN_TOKENS.colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: 24,
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

interface BottomSheetProps extends ModalProps {
  snapPoints?: string[];
}

export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}: BottomSheetProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: DESIGN_TOKENS.colors.surface,
          borderTopLeftRadius: DESIGN_TOKENS.radius.card,
          borderTopRightRadius: DESIGN_TOKENS.radius.card,
          padding: DESIGN_TOKENS.spacing.lg,
          width: '100%',
          maxWidth: 500,
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: DESIGN_TOKENS.shadows.large,
          animation: `slideUp ${DESIGN_TOKENS.motion.page}ms ${MOTION_EASING.easeOutSoft}`,
        }}
      >
        <div style={{
          width: 40,
          height: 4,
          background: DESIGN_TOKENS.colors.border,
          borderRadius: 2,
          margin: '0 auto 16px',
        }} />
        {title && (
          <h2 style={{
            margin: '0 0 16px 0',
            ...DESIGN_TOKENS.typography.headingM,
            color: DESIGN_TOKENS.colors.textPrimary,
          }}>
            {title}
          </h2>
        )}
        {children}
        {showCloseButton && (
          <button
            onClick={onClose}
            aria-label="Close sheet"
            style={{
              marginTop: DESIGN_TOKENS.spacing.lg,
              width: '100%',
              padding: `${DESIGN_TOKENS.spacing.md}px`,
              border: 'none',
              borderRadius: DESIGN_TOKENS.radius.button,
              background: DESIGN_TOKENS.colors.primary,
              color: 'white',
              ...DESIGN_TOKENS.typography.bodyMedium,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};