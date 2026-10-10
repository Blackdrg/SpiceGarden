"use client";
import React, { useState, useRef, useEffect } from 'react';
import { DESIGN_TOKENS } from './tokens';
export const Dropdown = ({ options, value, onChange, placeholder = 'Select...', label, error, disabled = false, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(() => {
        return options.find(opt => opt.value === value) || null;
    });
    const dropdownRef = useRef(null);
    const dropdownId = label ? `dropdown-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'custom-dropdown';
    useEffect(() => {
        setSelected(options.find(opt => opt.value === value) || null);
    }, [value, options]);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSelect = (option) => {
        if (!option.disabled) {
            setSelected(option);
            onChange?.(option.value);
            setIsOpen(false);
        }
    };
    return (React.createElement("div", { ref: dropdownRef, style: { position: 'relative', marginBottom: label ? DESIGN_TOKENS.spacing.sm : 0 } },
        label && (React.createElement("label", { htmlFor: dropdownId, style: {
                display: 'block',
                marginBottom: DESIGN_TOKENS.spacing.xs,
                ...DESIGN_TOKENS.typography.smallLabel,
                color: DESIGN_TOKENS.colors.textPrimary,
            } }, label)),
        React.createElement("button", { type: "button", id: dropdownId, disabled: disabled, onClick: () => !disabled && setIsOpen(!isOpen), "aria-label": label || 'Dropdown', "aria-haspopup": "listbox", "aria-expanded": isOpen, style: {
                width: '100%',
                textAlign: 'left',
                position: 'relative',
                padding: `${DESIGN_TOKENS.spacing.md}px`,
                borderRadius: `${DESIGN_TOKENS.radius.input}px`,
                border: `1px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border}`,
                backgroundColor: disabled ? DESIGN_TOKENS.colors.elevated : DESIGN_TOKENS.colors.surface,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: DESIGN_TOKENS.typography.fontFamily,
                display: 'block',
            } },
            React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.body,
                    color: selected ? DESIGN_TOKENS.colors.textPrimary : DESIGN_TOKENS.colors.textSecondary,
                } }, selected ? selected.label : placeholder),
            React.createElement("span", { style: {
                    position: 'absolute',
                    right: DESIGN_TOKENS.spacing.md,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: DESIGN_TOKENS.colors.textSecondary,
                } }, "\u25BC")),
        isOpen && (React.createElement("div", { role: "listbox", style: {
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
            } }, options.map((option) => (React.createElement("button", { type: "button", key: option.value, onClick: () => handleSelect(option), role: "option", disabled: option.disabled, "aria-selected": selected?.value === option.value, style: {
                width: '100%',
                textAlign: 'left',
                border: 'none',
                display: 'block',
                padding: `${DESIGN_TOKENS.spacing.md}px`,
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                backgroundColor: selected?.value === option.value ? DESIGN_TOKENS.colors.elevated : 'transparent',
                color: option.disabled ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.textPrimary,
                opacity: option.disabled ? 0.5 : 1,
                outline: 'none',
            } }, option.label))))),
        error && (React.createElement("span", { role: "alert", style: {
                ...DESIGN_TOKENS.typography.smallLabel,
                color: DESIGN_TOKENS.colors.danger,
                marginTop: DESIGN_TOKENS.spacing.xs,
                display: 'block',
            } }, error))));
};
Dropdown.displayName = 'Dropdown';
