"use client";

import React, { forwardRef } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = 'text', placeholder, value, error, helperText, onChange, id, startIcon, endIcon, fullWidth = true, inputSize = 'md', className, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2, 9)}`;

    const sizeStyles = {
      sm: { padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[3]}px`, fontSize: 14, minHeight: 36, borderRadius: DESIGN_TOKENS.radius.md },
      md: { padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[4]}px`, fontSize: 15, minHeight: 44, borderRadius: DESIGN_TOKENS.radius.lg },
      lg: { padding: `${DESIGN_TOKENS.spacing[4]}px ${DESIGN_TOKENS.spacing[5]}px`, fontSize: 16, minHeight: 52, borderRadius: DESIGN_TOKENS.radius.lg },
    };

    const currentSize = sizeStyles[inputSize];

    return (
      <div style={{
        marginBottom: error ? DESIGN_TOKENS.spacing[5] : DESIGN_TOKENS.spacing[4],
        fontFamily: DESIGN_TOKENS.typography.fontFamily,
        width: fullWidth ? '100%' : undefined,
      }} className={className}>
        {label && (
          <label htmlFor={inputId} style={{
            display: 'block',
            marginBottom: DESIGN_TOKENS.spacing[2],
            ...DESIGN_TOKENS.typography.smallLabel,
            color: error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.textPrimary,
            letterSpacing: '0.01em',
          }}>
            {label}
          </label>
        )}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          {startIcon && (
            <div style={{
              position: 'absolute',
              left: currentSize.padding.split(' ')[0],
              color: DESIGN_TOKENS.colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            style={{
              width: fullWidth ? '100%' : undefined,
              padding: startIcon ? `${currentSize.padding.split(' ')[0]} ${currentSize.padding.split(' ')[1]} ${currentSize.padding.split(' ')[0]} ${DESIGN_TOKENS.spacing[8]}px` : currentSize.padding,
              borderRadius: currentSize.borderRadius,
              border: `1px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border}`,
              backgroundColor: DESIGN_TOKENS.colors.surface,
               boxSizing: 'border-box',
               minHeight: currentSize.minHeight,
               ...DESIGN_TOKENS.typography.body,
               transition: `border-color ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}, box-shadow ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
              outline: 'none',
              fontFamily: DESIGN_TOKENS.typography.fontFamily,
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 3px ${DESIGN_TOKENS.colors.primary}22`;
              e.currentTarget.style.borderColor = error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border;
            }}
            {...props}
          />
          {endIcon && (
            <div style={{
              position: 'absolute',
              right: currentSize.padding.split(' ')[1],
              color: DESIGN_TOKENS.colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <span
            id={`${inputId}-error`}
            role="alert"
            style={{
              ...DESIGN_TOKENS.typography.caption,
              color: DESIGN_TOKENS.colors.danger,
              marginTop: DESIGN_TOKENS.spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span
            id={`${inputId}-helper`}
            style={{
              ...DESIGN_TOKENS.typography.caption,
              color: DESIGN_TOKENS.colors.textSecondary,
              marginTop: DESIGN_TOKENS.spacing[2],
              display: 'block',
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
