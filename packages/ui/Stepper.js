"use client";
import React from 'react';
import { DESIGN_TOKENS } from './tokens';
export const Stepper = ({ value, onChange, min = 1, max = 99, step = 1, label, disabled = false, }) => {
    const stepperId = label ? `stepper-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'stepper-control';
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
    return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.md } },
        label && (React.createElement("label", { htmlFor: stepperId, style: {
                ...DESIGN_TOKENS.typography.body,
                color: DESIGN_TOKENS.colors.textPrimary,
            } }, label)),
        React.createElement("div", { id: stepperId, role: "group", "aria-label": label || 'Stepper', style: {
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${DESIGN_TOKENS.colors.border}`,
                borderRadius: DESIGN_TOKENS.radius.input,
                backgroundColor: disabled ? DESIGN_TOKENS.colors.elevated : DESIGN_TOKENS.colors.surface,
            } },
            React.createElement("button", { onClick: decrement, disabled: disabled || value <= min, "aria-label": "Decrease quantity", style: {
                    width: 36,
                    height: 36,
                    border: 'none',
                    background: 'transparent',
                    color: disabled || value <= min ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.textPrimary,
                    cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
                    fontSize: 18,
                    fontFamily: DESIGN_TOKENS.typography.fontFamily,
                } }, "\u2212"),
            React.createElement("span", { style: {
                    minWidth: 40,
                    textAlign: 'center',
                    ...DESIGN_TOKENS.typography.body,
                    fontWeight: 600,
                    color: DESIGN_TOKENS.colors.textPrimary,
                } }, value),
            React.createElement("button", { onClick: increment, disabled: disabled || value >= max, "aria-label": "Increase quantity", style: {
                    width: 36,
                    height: 36,
                    border: 'none',
                    background: 'transparent',
                    color: disabled || value >= max ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.textPrimary,
                    cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
                    fontSize: 18,
                    fontFamily: DESIGN_TOKENS.typography.fontFamily,
                } }, "+"))));
};
Stepper.displayName = 'Stepper';
