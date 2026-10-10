"use client";
import React, { forwardRef } from 'react';
import { DESIGN_TOKENS } from './tokens';
export const SearchInput = forwardRef(({ placeholder = 'Search...', value, onChange, onSearch, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(e.target.value);
        }
        onKeyDown?.(e);
    };
    return (React.createElement("div", { style: { position: 'relative', width: '100%' } },
        React.createElement("span", { style: {
                position: 'absolute',
                left: DESIGN_TOKENS.spacing.md,
                top: '50%',
                transform: 'translateY(-50%)',
                color: DESIGN_TOKENS.colors.textSecondary,
                fontSize: 16,
                pointerEvents: 'none',
            } }, "\uD83D\uDD0D"),
        React.createElement("input", { ref: ref, type: "search", placeholder: placeholder, value: value, onChange: onChange, onKeyDown: handleKeyDown, "aria-label": "Search", style: {
                width: '100%',
                padding: `${DESIGN_TOKENS.spacing.md}px`,
                paddingLeft: `${DESIGN_TOKENS.spacing.xl}px`,
                paddingRight: `${DESIGN_TOKENS.spacing.xl}px`,
                borderRadius: `${DESIGN_TOKENS.radius.input}px`,
                border: `1px solid ${DESIGN_TOKENS.colors.border}`,
                backgroundColor: DESIGN_TOKENS.colors.surface,
                ...DESIGN_TOKENS.typography.body,
                outline: 'none',
                transition: `border-color ${DESIGN_TOKENS.motion.micro}ms`,
                fontFamily: DESIGN_TOKENS.typography.fontFamily,
            } })));
});
SearchInput.displayName = 'SearchInput';
