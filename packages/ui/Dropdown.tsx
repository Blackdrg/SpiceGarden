import React, { useState, useRef, useEffect } from 'react';
import { DESIGN_TOKENS } from './tokens';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<DropdownOption | null>(
    options.find(opt => opt.value === value) || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(options.find(opt => opt.value === value) || null);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      setSelected(option);
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ marginBottom: label ? DESIGN_TOKENS.spacing.sm : 0 }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: DESIGN_TOKENS.spacing.xs,
          ...DESIGN_TOKENS.typography.smallLabel,
          color: DESIGN_TOKENS.colors.textPrimary,
        }}>
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-label={label || 'Dropdown'}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          position: 'relative',
          padding: `${DESIGN_TOKENS.spacing.md}px`,
          borderRadius: `${DESIGN_TOKENS.radius.input}px`,
          border: `1px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border}`,
          backgroundColor: disabled ? DESIGN_TOKENS.colors.elevated : DESIGN_TOKENS.colors.surface,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: DESIGN_TOKENS.typography.fontFamily,
        }}
      >
        <span style={{
          ...DESIGN_TOKENS.typography.body,
          color: selected ? DESIGN_TOKENS.colors.textPrimary : DESIGN_TOKENS.colors.textSecondary,
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{
          position: 'absolute',
          right: DESIGN_TOKENS.spacing.md,
          top: '50%',
          transform: 'translateY(-50%)',
          color: DESIGN_TOKENS.colors.textSecondary,
        }}>
          ▼
        </span>
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: DESIGN_TOKENS.spacing.xs,
            backgroundColor: DESIGN_TOKENS.colors.surface,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            borderRadius: DESIGN_TOKENS.radius.md,
            boxShadow: DESIGN_TOKENS.shadows.medium,
            zIndex: 1000,
            maxHeight: 200,
            overflowY: 'auto',
          }}>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={selected?.value === option.value}
                style={{
                  padding: `${DESIGN_TOKENS.spacing.md}px`,
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  backgroundColor: selected?.value === option.value ? DESIGN_TOKENS.colors.elevated : 'transparent',
                  color: option.disabled ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.textPrimary,
                  opacity: option.disabled ? 0.5 : 1,
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <span role="alert" style={{
          ...DESIGN_TOKENS.typography.smallLabel,
          color: DESIGN_TOKENS.colors.danger,
          marginTop: DESIGN_TOKENS.spacing.xs,
          display: 'block',
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';