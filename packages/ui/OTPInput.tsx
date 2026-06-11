import React, { useState, useRef, useEffect } from 'react';
import { DESIGN_TOKENS } from './tokens';

interface OTPInputProps {
  length?: 4 | 6;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OTPInput = ({
  length = 4,
  value = '',
  onChange,
  onComplete,
  error,
  disabled = false,
}: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(length).fill(null));

  useEffect(() => {
    setOtp(value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length));
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, justifyContent: 'center' }}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
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
          }}
        />
      ))}
      {error && (
        <span role="alert" style={{
          ...DESIGN_TOKENS.typography.smallLabel,
          color: DESIGN_TOKENS.colors.danger,
          marginTop: DESIGN_TOKENS.spacing.xs,
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

OTPInput.displayName = 'OTPInput';