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
exports.Dropdown = void 0;
const react_1 = __importStar(require("react"));
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
    return (react_1.default.createElement("div", { ref: dropdownRef, style: { marginBottom: label ? tokens_1.DESIGN_TOKENS.spacing.sm : 0 } },
        label && (react_1.default.createElement("label", { style: {
                display: 'block',
                marginBottom: tokens_1.DESIGN_TOKENS.spacing.xs,
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
            } }, label)),
        react_1.default.createElement("div", { onClick: () => !disabled && setIsOpen(!isOpen), "aria-label": label || 'Dropdown', "aria-haspopup": "listbox", "aria-expanded": isOpen, style: {
                position: 'relative',
                padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                borderRadius: `${tokens_1.DESIGN_TOKENS.radius.input}px`,
                border: `1px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                backgroundColor: disabled ? tokens_1.DESIGN_TOKENS.colors.elevated : tokens_1.DESIGN_TOKENS.colors.surface,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
            } },
            react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    color: selected ? tokens_1.DESIGN_TOKENS.colors.textPrimary : tokens_1.DESIGN_TOKENS.colors.textSecondary,
                } }, selected ? selected.label : placeholder),
            react_1.default.createElement("span", { style: {
                    position: 'absolute',
                    right: tokens_1.DESIGN_TOKENS.spacing.md,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                } }, "\u25BC"),
            isOpen && (react_1.default.createElement("div", { style: {
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
                } }, options.map((option) => (react_1.default.createElement("div", { key: option.value, onClick: () => handleSelect(option), role: "option", "aria-selected": selected?.value === option.value, style: {
                    padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: selected?.value === option.value ? tokens_1.DESIGN_TOKENS.colors.elevated : 'transparent',
                    color: option.disabled ? tokens_1.DESIGN_TOKENS.colors.textSecondary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    opacity: option.disabled ? 0.5 : 1,
                } }, option.label)))))),
        error && (react_1.default.createElement("span", { role: "alert", style: {
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: tokens_1.DESIGN_TOKENS.colors.danger,
                marginTop: tokens_1.DESIGN_TOKENS.spacing.xs,
                display: 'block',
            } }, error))));
};
exports.Dropdown = Dropdown;
exports.Dropdown.displayName = 'Dropdown';
