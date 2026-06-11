"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const tokens_1 = require("./tokens");
exports.Input = (0, react_1.forwardRef)(({ label, type = 'text', placeholder, value, error, helperText, onChange, id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            marginBottom: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
            fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily
        }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: inputId, style: {
                    display: 'block',
                    marginBottom: `${tokens_1.DESIGN_TOKENS.spacing.xs}px`,
                    ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                    color: error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.textPrimary
                }, children: label }), (0, jsx_runtime_1.jsx)("input", { ref: ref, id: inputId, type: type, placeholder: placeholder, value: value, onChange: onChange, "aria-invalid": !!error, "aria-describedby": error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined, style: {
                    width: '100%',
                    padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                    borderRadius: `${tokens_1.DESIGN_TOKENS.radius.input}px`,
                    border: `1px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                    boxSizing: 'border-box',
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    transition: `border-color ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}, box-shadow ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                    outline: 'none',
                }, onFocus: (e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens_1.DESIGN_TOKENS.colors.primary}33`;
                }, onBlur: (e) => {
                    e.currentTarget.style.boxShadow = 'none';
                }, ...props }), error && ((0, jsx_runtime_1.jsx)("span", { id: `${inputId}-error`, role: "alert", style: {
                    ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                    color: tokens_1.DESIGN_TOKENS.colors.danger,
                    marginTop: `${tokens_1.DESIGN_TOKENS.spacing.xs}px`,
                    display: 'block'
                }, children: error })), helperText && !error && ((0, jsx_runtime_1.jsx)("span", { id: `${inputId}-helper`, style: {
                    ...tokens_1.DESIGN_TOKENS.typography.caption,
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    marginTop: `${tokens_1.DESIGN_TOKENS.spacing.xs}px`,
                    display: 'block'
                }, children: helperText }))] }));
});
exports.Input.displayName = 'Input';
