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
exports.Input = (0, react_1.forwardRef)(({ label, type = 'text', placeholder, value, error, helperText, onChange, id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (react_1.default.createElement("div", { style: {
            marginBottom: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
            fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily
        } },
        react_1.default.createElement("label", { htmlFor: inputId, style: {
                display: 'block',
                marginBottom: `${tokens_1.DESIGN_TOKENS.spacing.xs}px`,
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.textPrimary
            } }, label),
        react_1.default.createElement("input", { ref: ref, id: inputId, type: type, placeholder: placeholder, value: value, onChange: onChange, "aria-invalid": !!error, "aria-describedby": error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined, style: {
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
            }, ...props }),
        error && (react_1.default.createElement("span", { id: `${inputId}-error`, role: "alert", style: {
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: tokens_1.DESIGN_TOKENS.colors.danger,
                marginTop: `${tokens_1.DESIGN_TOKENS.spacing.xs}px`,
                display: 'block'
            } }, error)),
        helperText && !error && (react_1.default.createElement("span", { id: `${inputId}-helper`, style: {
                ...tokens_1.DESIGN_TOKENS.typography.caption,
                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                marginTop: `${tokens_1.DESIGN_TOKENS.spacing.xs}px`,
                display: 'block'
            } }, helperText))));
});
exports.Input.displayName = 'Input';
