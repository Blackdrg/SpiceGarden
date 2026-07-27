"use client";

import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

const sizeConfig = {
  sm: { height: 32, btnWidth: 28, fontSize: 16 },
  md: { height: 40, btnWidth: 36, fontSize: 18 },
  lg: { height: 48, btnWidth: 44, fontSize: 20 },
};

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Stepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  label,
  disabled = false,
  size = 'md',
}: StepperProps) => {
  const increment = () => {
    if (!disabled && value < max) {
      onChange(value + step);
    }
  };

  const decrement = () => {
    if (!disabled && value > min) {
      onChange(value - step);
    }
  };

  const config = sizeConfig[size];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[3] }}>
      {label && (
        <label htmlFor="stepper-value" style={{
          ...DESIGN_TOKENS.typography.bodySmall,
          color: DESIGN_TOKENS.colors.textPrimary,
        }}>
          {label}
        </label>
      )}
      <div id="stepper-value" role="group" aria-label={label || 'Stepper'} style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
        borderRadius: DESIGN_TOKENS.radius.lg,
        backgroundColor: disabled ? DESIGN_TOKENS.colors.elevated : DESIGN_TOKENS.colors.surface,
        overflow: 'hidden',
      }}>
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || value <= min}
          aria-label="Decrease quantity"
          style={{
            width: config.btnWidth,
            height: config.height,
            border: 'none',
            background: 'transparent',
            color: disabled || value <= min ? DESIGN_TOKENS.colors.textTertiary : DESIGN_TOKENS.colors.textPrimary,
            cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
            fontSize: config.fontSize,
            fontFamily: DESIGN_TOKENS.typography.fontFamily,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all ${DESIGN_TOKENS.motion.micro}ms`,
          }}
          onMouseEnter={(e) => { if (!disabled && value > min) e.currentTarget.style.background = DESIGN_TOKENS.colors.elevated; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          −
        </button>
        <span style={{
          minWidth: 48,
          textAlign: 'center',
          ...DESIGN_TOKENS.typography.bodyMedium,
          fontWeight: 700,
          color: DESIGN_TOKENS.colors.textPrimary,
          borderLeft: `1px solid ${DESIGN_TOKENS.colors.borderLight}`,
          borderRight: `1px solid ${DESIGN_TOKENS.colors.borderLight}`,
          lineHeight: `${config.height}px`,
        }}>
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={disabled || value >= max}
          aria-label="Increase quantity"
          style={{
            width: config.btnWidth,
            height: config.height,
            border: 'none',
            background: 'transparent',
            color: disabled || value >= max ? DESIGN_TOKENS.colors.textTertiary : DESIGN_TOKENS.colors.textPrimary,
            cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
            fontSize: config.fontSize,
            fontFamily: DESIGN_TOKENS.typography.fontFamily,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all ${DESIGN_TOKENS.motion.micro}ms`,
          }}
          onMouseEnter={(e) => { if (!disabled && value < max) e.currentTarget.style.background = DESIGN_TOKENS.colors.elevated; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          +
        </button>
      </div>
    </div>
  );
};

Stepper.displayName = 'Stepper';
