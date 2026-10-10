"use client";
import React, { useState, useRef } from 'react';
import { DESIGN_TOKENS } from './tokens';
const getDigits = (val, len) => {
    const chars = (val || '').split('').slice(0, len);
    while (chars.length < len) {
        chars.push('');
    }
    return chars;
};
export const OTPInput = ({ length = 4, value = '', onChange, onComplete, error, disabled = false, }) => {
    const [internalOtp, setInternalOtp] = useState(() => getDigits(value, length));
    const inputRefs = useRef([]);
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
    return (React.createElement("div", { style: { display: 'flex', gap: DESIGN_TOKENS.spacing.sm, justifyContent: 'center' } },
        slots.map((slot) => {
            const digit = currentOtp[slot.index] || '';
            return (React.createElement("input", { key: slot.id, ref: (el) => { inputRefs.current[slot.index] = el; }, type: "text", inputMode: "numeric", maxLength: 1, value: digit, onChange: (e) => handleChange(slot.index, e.target.value), onKeyDown: (e) => handleKeyDown(slot.index, e), onPaste: handlePaste, disabled: disabled, "aria-label": `OTP digit ${slot.index + 1}`, "aria-invalid": !!error, style: {
                    width: 48,
                    height: 48,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 600,
                    borderRadius: DESIGN_TOKENS.radius.md,
                    border: `2px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border}`,
                    backgroundColor: DESIGN_TOKENS.colors.surface,
                    color: DESIGN_TOKENS.colors.textPrimary,
                    outline: 'none',
                    transition: `border-color ${DESIGN_TOKENS.motion.micro}ms`,
                    fontFamily: DESIGN_TOKENS.typography.fontFamily,
                } }));
        }),
        error && (React.createElement("span", { role: "alert", style: {
                ...DESIGN_TOKENS.typography.smallLabel,
                color: DESIGN_TOKENS.colors.danger,
                marginTop: DESIGN_TOKENS.spacing.xs,
            } }, error))));
};
OTPInput.displayName = 'OTPInput';
