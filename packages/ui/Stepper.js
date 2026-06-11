"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stepper = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const tokens_1 = require("./tokens");
const Stepper = ({ value, onChange, min = 1, max = 99, step = 1, label, disabled = false, }) => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.md }, children: [label && ((0, jsx_runtime_1.jsx)("label", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                }, children: label })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.input,
                    backgroundColor: disabled ? tokens_1.DESIGN_TOKENS.colors.elevated : tokens_1.DESIGN_TOKENS.colors.surface,
                }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: decrement, disabled: disabled || value <= min, "aria-label": "Decrease quantity", style: {
                            width: 36,
                            height: 36,
                            border: 'none',
                            background: 'transparent',
                            color: disabled || value <= min ? tokens_1.DESIGN_TOKENS.colors.textSecondary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                            cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
                            fontSize: 18,
                            fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                        }, children: "\u2212" }), (0, jsx_runtime_1.jsx)("span", { style: {
                            minWidth: 40,
                            textAlign: 'center',
                            ...tokens_1.DESIGN_TOKENS.typography.body,
                            fontWeight: 600,
                            color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                        }, children: value }), (0, jsx_runtime_1.jsx)("button", { onClick: increment, disabled: disabled || value >= max, "aria-label": "Increase quantity", style: {
                            width: 36,
                            height: 36,
                            border: 'none',
                            background: 'transparent',
                            color: disabled || value >= max ? tokens_1.DESIGN_TOKENS.colors.textSecondary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                            cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
                            fontSize: 18,
                            fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                        }, children: "+" })] })] }));
};
exports.Stepper = Stepper;
exports.Stepper.displayName = 'Stepper';
