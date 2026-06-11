"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dropdown = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const tokens_1 = require("./tokens");
const Dropdown = ({ options, value, onChange, placeholder = 'Select...', label, error, disabled = false, }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [selected, setSelected] = (0, react_1.useState)(options.find(opt => opt.value === value) || null);
    const dropdownRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        setSelected(options.find(opt => opt.value === value) || null);
    }, [value, options]);
    (0, react_1.useEffect)(() => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { ref: dropdownRef, style: { marginBottom: label ? tokens_1.DESIGN_TOKENS.spacing.sm : 0 }, children: [label && ((0, jsx_runtime_1.jsx)("label", { style: {
                    display: 'block',
                    marginBottom: tokens_1.DESIGN_TOKENS.spacing.xs,
                    ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                }, children: label })), (0, jsx_runtime_1.jsxs)("div", { onClick: () => !disabled && setIsOpen(!isOpen), "aria-label": label || 'Dropdown', "aria-haspopup": "listbox", "aria-expanded": isOpen, style: {
                    position: 'relative',
                    padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                    borderRadius: `${tokens_1.DESIGN_TOKENS.radius.input}px`,
                    border: `1px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                    backgroundColor: disabled ? tokens_1.DESIGN_TOKENS.colors.elevated : tokens_1.DESIGN_TOKENS.colors.surface,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                            ...tokens_1.DESIGN_TOKENS.typography.body,
                            color: selected ? tokens_1.DESIGN_TOKENS.colors.textPrimary : tokens_1.DESIGN_TOKENS.colors.textSecondary,
                        }, children: selected ? selected.label : placeholder }), (0, jsx_runtime_1.jsx)("span", { style: {
                            position: 'absolute',
                            right: tokens_1.DESIGN_TOKENS.spacing.md,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                        }, children: "\u25BC" }), isOpen && ((0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: tokens_1.DESIGN_TOKENS.spacing.xs,
                            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                            borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
                            boxShadow: tokens_1.DESIGN_TOKENS.shadows.medium,
                            zIndex: 1000,
                            maxHeight: 200,
                            overflowY: 'auto',
                        }, children: options.map((option) => ((0, jsx_runtime_1.jsx)("div", { onClick: () => handleSelect(option), role: "option", "aria-selected": selected?.value === option.value, style: {
                                padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                                cursor: option.disabled ? 'not-allowed' : 'pointer',
                                backgroundColor: selected?.value === option.value ? tokens_1.DESIGN_TOKENS.colors.elevated : 'transparent',
                                color: option.disabled ? tokens_1.DESIGN_TOKENS.colors.textSecondary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                                opacity: option.disabled ? 0.5 : 1,
                            }, children: option.label }, option.value))) }))] }), error && ((0, jsx_runtime_1.jsx)("span", { role: "alert", style: {
                    ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                    color: tokens_1.DESIGN_TOKENS.colors.danger,
                    marginTop: tokens_1.DESIGN_TOKENS.spacing.xs,
                    display: 'block',
                }, children: error }))] }));
};
exports.Dropdown = Dropdown;
exports.Dropdown.displayName = 'Dropdown';
