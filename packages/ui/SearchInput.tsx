"use client";

import React, { forwardRef } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  fullWidth?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ placeholder = 'Search...', value, onChange, onSearch, onKeyDown, fullWidth = true, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
      }
      onKeyDown?.(e);
    };

    return (
      <div style={{ position: 'relative', width: fullWidth ? '100%' : undefined }}>
        <div style={{
          position: 'absolute',
          left: DESIGN_TOKENS.spacing[4],
          top: '50%',
          transform: 'translateY(-50%)',
          color: DESIGN_TOKENS.colors.textTertiary,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          style={{
            width: fullWidth ? '100%' : undefined,
            padding: `${DESIGN_TOKENS.spacing[3]}px ${DESIGN_TOKENS.spacing[4]}px`,
            paddingLeft: DESIGN_TOKENS.spacing[10],
            paddingRight: DESIGN_TOKENS.spacing[4],
            borderRadius: DESIGN_TOKENS.radius.lg,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            backgroundColor: DESIGN_TOKENS.colors.surface,
            ...DESIGN_TOKENS.typography.body,
            outline: 'none',
            transition: `border-color ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}, box-shadow ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
            fontFamily: DESIGN_TOKENS.typography.fontFamily,
            minHeight: 44,
            boxShadow: DESIGN_TOKENS.shadows.xs,
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 3px ${DESIGN_TOKENS.colors.primary}22`;
            e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = DESIGN_TOKENS.shadows.xs;
            e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.border;
          }}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
