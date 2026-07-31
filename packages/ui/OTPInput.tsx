"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface OTPInputProps {
  length?: 4 | 6;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

export const OTPInput = ({
  length = 4,
  value = '',
  onChange,
  onComplete,
  error,
  disabled = false,
  label,
}: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(() => value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length));
  const inputRefs = useRef<Array<HTMLInputElement | null> | null>(null);
  if (inputRefs.current === null) {
    inputRefs.current = Array.from({ length }, () => null as HTMLInputElement | null);
  }
  const inputKeys = useMemo(() => Array.from({ length }, (_, i) => `otp-digit-${i}`), [length]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    const newValue = newOtp.join('');
    onChange?.(newValue);

    if (digit && index < length - 1) {
      inputRefs.current![index + 1]?.focus();
    }

    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current![index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current![index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current![index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: DESIGN_TOKENS.spacing[3] }}>
      {label && (
        <label htmlFor="otp-input-0" style={{
          ...DESIGN_TOKENS.typography.smallLabel,
          color: error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.textPrimary,
        }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing[3], justifyContent: 'center' }}>
        {otp.map((digit, index) => (
          <input
            key={inputKeys[index]}
            id={`otp-input-${index}`}
            ref={(el) => { inputRefs.current![index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`OTP digit ${index + 1}`}
            aria-invalid={!!error}
            style={{
              width: 52,
              height: 56,
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 700,
              borderRadius: DESIGN_TOKENS.radius.lg,
              border: `2px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border}`,
              backgroundColor: DESIGN_TOKENS.colors.surface,
              color: DESIGN_TOKENS.colors.textPrimary,
              outline: 'none',
              transition: `border-color ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}, box-shadow ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
              fontFamily: DESIGN_TOKENS.typography.fontFamily,
              boxShadow: digit ? `0 0 0 3px ${DESIGN_TOKENS.colors.primary}15` : 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${DESIGN_TOKENS.colors.primary}22`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border;
              e.currentTarget.style.boxShadow = digit ? `0 0 0 3px ${DESIGN_TOKENS.colors.primary}15` : 'none';
            }}
          />
        ))}
      </div>
      {error && (
        <span role="alert" style={{
          ...DESIGN_TOKENS.typography.caption,
          color: DESIGN_TOKENS.colors.danger,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

OTPInput.displayName = 'OTPInput';
