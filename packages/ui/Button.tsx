"use client";

import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';
import styles from './Button.module.css';

interface ButtonProps {
  label?: string;
  children?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'loading' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  ariaLabel?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const Button = ({
  label,
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  ariaLabel,
  className,
  type = 'button',
  fullWidth = false,
}: ButtonProps) => {
  const baseClass = `${styles.button} ${styles[variant]} ${styles[size]}`;
  const mergedClassName = className ? `${baseClass} ${className}` : baseClass;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || label}
      aria-disabled={disabled || isLoading}
      className={mergedClassName}
      style={{ width: fullWidth ? '100%' : undefined, ...style }}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', animation: 'sg-spin 0.8s linear infinite' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </span>
      ) : null}
      <span className={styles.label}>{label || children}</span>
    </button>
  );
};

Button.displayName = 'Button';
