"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled = false,
  fullWidth = true,
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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      setSelected(option);
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ marginBottom: error ? DESIGN_TOKENS.spacing[5] : DESIGN_TOKENS.spacing[4], width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: DESIGN_TOKENS.spacing[2],
          ...DESIGN_TOKENS.typography.smallLabel,
          color: error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.textPrimary,
        }}>
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="combobox"
        aria-label={label || 'Dropdown'}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && setIsOpen(!isOpen); } }}
        style={{
          position: 'relative',
          padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[10]}px ${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[4]}px`,
          borderRadius: DESIGN_TOKENS.radius.lg,
          border: `1px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border}`,
          backgroundColor: disabled ? DESIGN_TOKENS.colors.elevated : DESIGN_TOKENS.colors.surface,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: DESIGN_TOKENS.typography.fontFamily,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: `all ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
          minHeight: 44,
          boxShadow: isOpen ? `0 0 0 3px ${DESIGN_TOKENS.colors.primary}22` : DESIGN_TOKENS.shadows.xs,
        }}
      >
        <span style={{
          ...DESIGN_TOKENS.typography.bodySmall,
          color: selected ? DESIGN_TOKENS.colors.textPrimary : DESIGN_TOKENS.colors.textTertiary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{
          position: 'absolute',
          right: DESIGN_TOKENS.spacing[4],
          top: '50%',
          transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
          color: DESIGN_TOKENS.colors.textTertiary,
          transition: `transform ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6L8 10L12 6" />
          </svg>
        </span>
        {isOpen && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: DESIGN_TOKENS.spacing[2],
              backgroundColor: DESIGN_TOKENS.colors.surface,
              border: `1px solid ${DESIGN_TOKENS.colors.border}`,
              borderRadius: DESIGN_TOKENS.radius.lg,
              boxShadow: DESIGN_TOKENS.shadows.large,
              zIndex: DESIGN_TOKENS.zIndex.dropdown,
              maxHeight: 240,
              overflowY: 'auto',
              animation: `sg-dropdown-in ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={selected?.value === option.value}
                aria-disabled={option.disabled}
                onClick={() => handleSelect(option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DESIGN_TOKENS.spacing[3],
                  padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[4]}px`,
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  backgroundColor: selected?.value === option.value ? DESIGN_TOKENS.colors.primaryLight : 'transparent',
                  color: option.disabled ? DESIGN_TOKENS.colors.textTertiary : DESIGN_TOKENS.colors.textPrimary,
                  opacity: option.disabled ? 0.5 : 1,
                  transition: `background ${DESIGN_TOKENS.motion.micro}ms`,
                  ...DESIGN_TOKENS.typography.bodySmall,
                }}
                onMouseEnter={(e) => { if (!option.disabled) e.currentTarget.style.background = DESIGN_TOKENS.colors.elevated; }}
                onMouseLeave={(e) => { if (!option.disabled && selected?.value !== option.value) e.currentTarget.style.background = 'transparent'; }}
              >
                {option.icon}
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <span role="alert" style={{
          ...DESIGN_TOKENS.typography.caption,
          color: DESIGN_TOKENS.colors.danger,
          marginTop: DESIGN_TOKENS.spacing[2],
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

Dropdown.displayName = 'Dropdown';
