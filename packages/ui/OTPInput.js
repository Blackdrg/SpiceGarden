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
const getDigits = (val, len) => {
    const chars = (val || '').split('').slice(0, len);
    while (chars.length < len) {
        chars.push('');
    }
    return chars;
};
const OTPInput = ({ length = 4, value = '', onChange, onComplete, error, disabled = false, }) => {
    const [internalOtp, setInternalOtp] = (0, react_1.useState)(() => getDigits(value, length));
    const inputRefs = (0, react_1.useRef)([]);
    const currentOtp = value !== undefined && value !== '' ? getDigits(value, length) : internalOtp;
    const handleChange = (index, digit) => {
        if (!/^\d*$/.test(digit))
            return;
        const newOtp = [...currentOtp];
        newOtp[index] = digit;
        setInternalOtp(newOtp);
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
        if (e.key === 'Backspace' && !currentOtp[index] && index > 0) {
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
            const newOtp = getDigits(paste, length);
            setInternalOtp(newOtp);
            onChange?.(paste);
            if (paste.length === length && onComplete) {
                onComplete(paste);
            }
        }
    };
    const slots = Array.from({ length }, (_, i) => ({ id: `otp-slot-${i}`, index: i }));
    return (react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.sm, justifyContent: 'center' } },
        slots.map((slot) => {
            const digit = currentOtp[slot.index] || '';
            return (react_1.default.createElement("input", { key: slot.id, ref: (el) => { inputRefs.current[slot.index] = el; }, type: "text", inputMode: "numeric", maxLength: 1, value: digit, onChange: (e) => handleChange(slot.index, e.target.value), onKeyDown: (e) => handleKeyDown(slot.index, e), onPaste: handlePaste, disabled: disabled, "aria-label": `OTP digit ${slot.index + 1}`, "aria-invalid": !!error, style: {
                    width: 48,
                    height: 48,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 600,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
                    border: `2px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    outline: 'none',
                    transition: `border-color ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                } }));
        }),
        error && (react_1.default.createElement("span", { role: "alert", style: {
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: tokens_1.DESIGN_TOKENS.colors.danger,
                marginTop: tokens_1.DESIGN_TOKENS.spacing.xs,
            } }, error))));
};
exports.OTPInput = OTPInput;
exports.OTPInput.displayName = 'OTPInput';
