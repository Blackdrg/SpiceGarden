"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stepper = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const Stepper = ({ value, onChange, min = 1, max = 99, step = 1, label, disabled = false, size = 'md', }) => {
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
    const sizeConfig = {
        sm: { height: 32, btnWidth: 28, fontSize: 16 },
        md: { height: 40, btnWidth: 36, fontSize: 18 },
        lg: { height: 48, btnWidth: 44, fontSize: 20 },
    };
    const config = sizeConfig[size];
    return (react_1.default.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing[3] } },
        label && (react_1.default.createElement("label", { style: {
                ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
            } }, label)),
        react_1.default.createElement("div", { style: {
                display: 'inline-flex',
                alignItems: 'center',
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                backgroundColor: disabled ? tokens_1.DESIGN_TOKENS.colors.elevated : tokens_1.DESIGN_TOKENS.colors.surface,
                overflow: 'hidden',
            } },
            react_1.default.createElement("button", { onClick: decrement, disabled: disabled || value <= min, "aria-label": "Decrease quantity", style: {
                    width: config.btnWidth,
                    height: config.height,
                    border: 'none',
                    background: 'transparent',
                    color: disabled || value <= min ? tokens_1.DESIGN_TOKENS.colors.textTertiary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
                    fontSize: config.fontSize,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                }, onMouseEnter: (e) => { if (!disabled && value > min)
                    e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.elevated; }, onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent'; } }, "\u2212"),
            react_1.default.createElement("span", { style: {
                    minWidth: 48,
                    textAlign: 'center',
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    fontWeight: 700,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    borderLeft: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
                    borderRight: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
                    lineHeight: `${config.height}px`,
                } }, value),
            react_1.default.createElement("button", { onClick: increment, disabled: disabled || value >= max, "aria-label": "Increase quantity", style: {
                    width: config.btnWidth,
                    height: config.height,
                    border: 'none',
                    background: 'transparent',
                    color: disabled || value >= max ? tokens_1.DESIGN_TOKENS.colors.textTertiary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
                    fontSize: config.fontSize,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                }, onMouseEnter: (e) => { if (!disabled && value < max)
                    e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.elevated; }, onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent'; } }, "+"))));
};
exports.Stepper = Stepper;
exports.Stepper.displayName = 'Stepper';
