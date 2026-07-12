"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const react_1 = __importStar(require("react"));
const tokens_1 = require("./tokens");
exports.Input = (0, react_1.forwardRef)(({ label, type = 'text', placeholder, value, error, helperText, onChange, id, startIcon, endIcon, fullWidth = true, inputSize = 'md', className, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2, 9)}`;
    const sizeStyles = {
        sm: { padding: `${tokens_1.DESIGN_TOKENS.spacing[2]}px ${tokens_1.DESIGN_TOKENS.spacing[3]}px`, fontSize: 14, minHeight: 36, borderRadius: tokens_1.DESIGN_TOKENS.radius.md },
        md: { padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[4]}px`, fontSize: 15, minHeight: 44, borderRadius: tokens_1.DESIGN_TOKENS.radius.lg },
        lg: { padding: `${tokens_1.DESIGN_TOKENS.spacing[4]}px ${tokens_1.DESIGN_TOKENS.spacing[5]}px`, fontSize: 16, minHeight: 52, borderRadius: tokens_1.DESIGN_TOKENS.radius.lg },
    };
    const currentSize = sizeStyles[inputSize];
    return (react_1.default.createElement("div", { style: {
            marginBottom: error ? tokens_1.DESIGN_TOKENS.spacing[5] : tokens_1.DESIGN_TOKENS.spacing[4],
            fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
            width: fullWidth ? '100%' : undefined,
        }, className: className },
        label && (react_1.default.createElement("label", { htmlFor: inputId, style: {
                display: 'block',
                marginBottom: tokens_1.DESIGN_TOKENS.spacing[2],
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                letterSpacing: '0.01em',
            } }, label)),
        react_1.default.createElement("div", { style: {
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
            } },
            startIcon && (react_1.default.createElement("div", { style: {
                    position: 'absolute',
                    left: currentSize.padding.split(' ')[0],
                    color: tokens_1.DESIGN_TOKENS.colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                } }, startIcon)),
            react_1.default.createElement("input", { ref: ref, id: inputId, type: type, placeholder: placeholder, value: value, onChange: onChange, "aria-invalid": !!error, "aria-describedby": error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined, style: {
                    width: fullWidth ? '100%' : undefined,
                    padding: startIcon ? `${currentSize.padding.split(' ')[0]} ${currentSize.padding.split(' ')[1]} ${currentSize.padding.split(' ')[0]} ${tokens_1.DESIGN_TOKENS.spacing[8]}px` : currentSize.padding,
                    borderRadius: currentSize.borderRadius,
                    border: `1px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                    boxSizing: 'border-box',
                    minHeight: currentSize.minHeight,
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    transition: `border-color ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}, box-shadow ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                    outline: 'none',
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                }, onFocus: (e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens_1.DESIGN_TOKENS.colors.primary}22`;
                    e.currentTarget.style.borderColor = error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.primary;
                }, onBlur: (e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border;
                }, ...props }),
            endIcon && (react_1.default.createElement("div", { style: {
                    position: 'absolute',
                    right: currentSize.padding.split(' ')[1],
                    color: tokens_1.DESIGN_TOKENS.colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                } }, endIcon))),
        error && (react_1.default.createElement("span", { id: `${inputId}-error`, role: "alert", style: {
                ...tokens_1.DESIGN_TOKENS.typography.caption,
                color: tokens_1.DESIGN_TOKENS.colors.danger,
                marginTop: tokens_1.DESIGN_TOKENS.spacing[2],
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            } }, error)),
        helperText && !error && (react_1.default.createElement("span", { id: `${inputId}-helper`, style: {
                ...tokens_1.DESIGN_TOKENS.typography.caption,
                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                marginTop: tokens_1.DESIGN_TOKENS.spacing[2],
                display: 'block',
            } }, helperText))));
});
exports.Input.displayName = 'Input';
