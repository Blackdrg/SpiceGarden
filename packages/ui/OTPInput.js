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
exports.OTPInput = void 0;
const react_1 = __importStar(require("react"));
const tokens_1 = require("./tokens");
const OTPInput = ({ length = 4, value = '', onChange, onComplete, error, disabled = false, label, }) => {
    const [otp, setOtp] = (0, react_1.useState)(() => value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length));
    const inputRefs = (0, react_1.useRef)(Array(length).fill(null));
    const inputKeys = (0, react_1.useMemo)(() => Array.from({ length }, (_, i) => `otp-digit-${i}`), [length]);
    const handleChange = (index, digit) => {
        if (!/^\d*$/.test(digit))
            return;
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        const newValue = newOtp.join('');
        onChange?.(newValue);
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
        if (newValue.length === length && onComplete) {
            onComplete(newValue);
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '');
        if (paste.length <= length) {
            const newOtp = paste.split('').concat(Array(length).fill('')).slice(0, length);
            setOtp(newOtp);
            onChange?.(paste);
            if (paste.length === length && onComplete) {
                onComplete(paste);
            }
        }
    };
    return (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing[3] } },
        label && (react_1.default.createElement("label", { htmlFor: "otp-input-0", style: {
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.textPrimary,
            } }, label)),
        react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing[3], justifyContent: 'center' } }, otp.map((digit, index) => (react_1.default.createElement("input", { key: inputKeys[index], id: `otp-input-${index}`, ref: (el) => { inputRefs.current[index] = el; }, type: "text", inputMode: "numeric", maxLength: 1, value: digit, onChange: (e) => handleChange(index, e.target.value), onKeyDown: (e) => handleKeyDown(index, e), onPaste: handlePaste, disabled: disabled, "aria-label": `OTP digit ${index + 1}`, "aria-invalid": !!error, style: {
                width: 52,
                height: 56,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 700,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                border: `2px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                outline: 'none',
                transition: `border-color ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}, box-shadow ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                boxShadow: digit ? `0 0 0 3px ${tokens_1.DESIGN_TOKENS.colors.primary}15` : 'none',
            }, onFocus: (e) => {
                e.currentTarget.style.borderColor = error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens_1.DESIGN_TOKENS.colors.primary}22`;
            }, onBlur: (e) => {
                e.currentTarget.style.borderColor = error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border;
                e.currentTarget.style.boxShadow = digit ? `0 0 0 3px ${tokens_1.DESIGN_TOKENS.colors.primary}15` : 'none';
            } })))),
        error && (react_1.default.createElement("span", { role: "alert", style: {
                ...tokens_1.DESIGN_TOKENS.typography.caption,
                color: tokens_1.DESIGN_TOKENS.colors.danger,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            } }, error))));
};
exports.OTPInput = OTPInput;
exports.OTPInput.displayName = 'OTPInput';
