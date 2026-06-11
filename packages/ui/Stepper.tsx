import React from 'react';
import { DESIGN_TOKENS } from './tokens';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
}

export const Stepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  label,
  disabled = false,
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.md }}>
      {label && (
        <label style={{
          ...DESIGN_TOKENS.typography.body,
          color: DESIGN_TOKENS.colors.textPrimary,
        }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
        borderRadius: DESIGN_TOKENS.radius.input,
        backgroundColor: disabled ? DESIGN_TOKENS.colors.elevated : DESIGN_TOKENS.colors.surface,
      }}>
        <button
          onClick={decrement}
          disabled={disabled || value <= min}
          aria-label="Decrease quantity"
          style={{
            width: 36,
            height: 36,
            border: 'none',
            background: 'transparent',
            color: disabled || value <= min ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.textPrimary,
            cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
            fontSize: 18,
            fontFamily: DESIGN_TOKENS.typography.fontFamily,
          }}
        >
          −
        </button>
        <span style={{
          minWidth: 40,
          textAlign: 'center',
          ...DESIGN_TOKENS.typography.body,
          fontWeight: 600,
          color: DESIGN_TOKENS.colors.textPrimary,
        }}>
          {value}
        </span>
        <button
          onClick={increment}
          disabled={disabled || value >= max}
          aria-label="Increase quantity"
          style={{
            width: 36,
            height: 36,
            border: 'none',
            background: 'transparent',
            color: disabled || value >= max ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.textPrimary,
            cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
            fontSize: 18,
            fontFamily: DESIGN_TOKENS.typography.fontFamily,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

Stepper.displayName = 'Stepper';