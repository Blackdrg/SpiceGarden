"use client";

import React, { useEffect, useRef } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  if (!isOpen) return null;

  const maxWidth = size === 'sm' ? 420 : size === 'lg' ? 720 : 560;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-label={title || 'Dialog'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: DESIGN_TOKENS.zIndex.modal,
        padding: DESIGN_TOKENS.spacing[5],
        animation: `sg-fade-in ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
        background: 'transparent',
        border: 'none',
      }}
    >
      <div
        onClick={closeOnOverlay ? onClose : undefined}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: DESIGN_TOKENS.colors.overlay,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: DESIGN_TOKENS.zIndex.modal,
          padding: DESIGN_TOKENS.spacing[5],
          animation: `sg-fade-in ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: DESIGN_TOKENS.colors.surface,
            borderRadius: DESIGN_TOKENS.radius.xxl,
            padding: DESIGN_TOKENS.spacing[7],
            maxWidth,
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: DESIGN_TOKENS.shadows.xl,
            animation: `sg-slide-up ${DESIGN_TOKENS.motion.standard}ms ${MOTION_EASING.easeOutSoft}`,
            position: 'relative',
          }}
        >
          {title && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: DESIGN_TOKENS.spacing[5],
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
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  style={{
                    border: 'none',
                    background: DESIGN_TOKENS.colors.elevated,
                    color: DESIGN_TOKENS.colors.textSecondary,
                    cursor: 'pointer',
                    fontSize: 20,
                    width: 36,
                    height: 36,
                    borderRadius: DESIGN_TOKENS.radius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `background ${DESIGN_TOKENS.motion.micro}ms`,
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = DESIGN_TOKENS.colors.border; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = DESIGN_TOKENS.colors.elevated; }}
                >
                  ×
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
      <style>{`
        @keyframes sg-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sg-slide-up { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </dialog>
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
  closeOnOverlay = true,
}: BottomSheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-label={title || 'Bottom sheet'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: DESIGN_TOKENS.zIndex.modal,
        background: 'transparent',
        border: 'none',
      }}
    >
      <div
        onClick={closeOnOverlay ? onClose : undefined}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: DESIGN_TOKENS.colors.overlay,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: DESIGN_TOKENS.zIndex.modal,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: DESIGN_TOKENS.colors.surface,
            borderTopLeftRadius: DESIGN_TOKENS.radius.xxl,
            borderTopRightRadius: DESIGN_TOKENS.radius.xxl,
            padding: DESIGN_TOKENS.spacing[6],
            width: '100%',
            maxWidth: 600,
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: DESIGN_TOKENS.shadows.xl,
            animation: `sg-slide-up ${DESIGN_TOKENS.motion.standard}ms ${MOTION_EASING.easeOutSoft}`,
          }}
        >
          <div style={{
            width: 40,
            height: 4,
            background: DESIGN_TOKENS.colors.border,
            borderRadius: 2,
            margin: `0 auto ${DESIGN_TOKENS.spacing[4]}px`,
          }} />
          {title && (
            <h2 style={{
              margin: `0 0 ${DESIGN_TOKENS.spacing[4]}px 0`,
              ...DESIGN_TOKENS.typography.headingM,
              color: DESIGN_TOKENS.colors.textPrimary,
            }}>
              {title}
            </h2>
          )}
          {children}
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sheet"
              style={{
                marginTop: DESIGN_TOKENS.spacing[5],
                width: '100%',
                padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[4]}px`,
                border: 'none',
                borderRadius: DESIGN_TOKENS.radius.lg,
                background: DESIGN_TOKENS.colors.elevated,
                color: DESIGN_TOKENS.colors.textPrimary,
                ...DESIGN_TOKENS.typography.bodyMedium,
                cursor: 'pointer',
                transition: `background ${DESIGN_TOKENS.motion.micro}ms`,
                minHeight: 44,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = DESIGN_TOKENS.colors.border; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = DESIGN_TOKENS.colors.elevated; }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
};
