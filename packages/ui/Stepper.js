"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stepper = void 0;
const react_1 = __importDefault(require("react"));
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
    return (react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.md } },
        label && (react_1.default.createElement("label", { style: {
                ...tokens_1.DESIGN_TOKENS.typography.body,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
            } }, label)),
        react_1.default.createElement("div", { style: {
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.input,
                backgroundColor: disabled ? tokens_1.DESIGN_TOKENS.colors.elevated : tokens_1.DESIGN_TOKENS.colors.surface,
            } },
            react_1.default.createElement("button", { onClick: decrement, disabled: disabled || value <= min, "aria-label": "Decrease quantity", style: {
                    width: 36,
                    height: 36,
                    border: 'none',
                    background: 'transparent',
                    color: disabled || value <= min ? tokens_1.DESIGN_TOKENS.colors.textSecondary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
                    fontSize: 18,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                } }, "\u2212"),
            react_1.default.createElement("span", { style: {
                    minWidth: 40,
                    textAlign: 'center',
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    fontWeight: 600,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                } }, value),
            react_1.default.createElement("button", { onClick: increment, disabled: disabled || value >= max, "aria-label": "Increase quantity", style: {
                    width: 36,
                    height: 36,
                    border: 'none',
                    background: 'transparent',
                    color: disabled || value >= max ? tokens_1.DESIGN_TOKENS.colors.textSecondary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
                    fontSize: 18,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                } }, "+"))));
};
exports.Stepper = Stepper;
exports.Stepper.displayName = 'Stepper';
