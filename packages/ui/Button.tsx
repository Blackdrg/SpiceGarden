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
}: ButtonProps) => {
  const baseClass = `${styles.button} ${styles[variant]} ${styles[size]}`;
  const mergedClassName = className ? `${baseClass} ${className}` : baseClass;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || label}
      aria-disabled={disabled || isLoading}
      className={mergedClassName}
      style={style}
    >
      {isLoading ? 'Loading...' : (label || children)}
    </button>
  );
};
