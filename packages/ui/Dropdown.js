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
const Dropdown = ({ options, value, onChange, placeholder = 'Select...', label, error, disabled = false, fullWidth = true, }) => {
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
        const handleEscape = (e) => {
            if (e.key === 'Escape')
                setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);
    const handleSelect = (option) => {
        if (!option.disabled) {
            setSelected(option);
            onChange?.(option.value);
            setIsOpen(false);
        }
    };
    return (react_1.default.createElement("div", { ref: dropdownRef, style: { marginBottom: error ? tokens_1.DESIGN_TOKENS.spacing[5] : tokens_1.DESIGN_TOKENS.spacing[4], width: fullWidth ? '100%' : undefined } },
        label && (react_1.default.createElement("label", { style: {
                display: 'block',
                marginBottom: tokens_1.DESIGN_TOKENS.spacing[2],
                ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                color: error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.textPrimary,
            } }, label)),
        react_1.default.createElement("div", { onClick: () => !disabled && setIsOpen(!isOpen), role: "combobox", "aria-label": label || 'Dropdown', "aria-haspopup": "listbox", "aria-expanded": isOpen, tabIndex: disabled ? -1 : 0, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                !disabled && setIsOpen(!isOpen);
            } }, style: {
                position: 'relative',
                padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[10]}px ${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[4]}px`,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                border: `1px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                backgroundColor: disabled ? tokens_1.DESIGN_TOKENS.colors.elevated : tokens_1.DESIGN_TOKENS.colors.surface,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                minHeight: 44,
                boxShadow: isOpen ? `0 0 0 3px ${tokens_1.DESIGN_TOKENS.colors.primary}22` : tokens_1.DESIGN_TOKENS.shadows.xs,
            } },
            react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                    color: selected ? tokens_1.DESIGN_TOKENS.colors.textPrimary : tokens_1.DESIGN_TOKENS.colors.textTertiary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                } }, selected ? selected.label : placeholder),
            react_1.default.createElement("span", { style: {
                    position: 'absolute',
                    right: tokens_1.DESIGN_TOKENS.spacing[4],
                    top: '50%',
                    transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
                    color: tokens_1.DESIGN_TOKENS.colors.textTertiary,
                    transition: `transform ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                    display: 'flex',
                    alignItems: 'center',
                } },
                react_1.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                    react_1.default.createElement("path", { d: "M4 6L8 10L12 6" }))),
            isOpen && (react_1.default.createElement("div", { role: "listbox", style: {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: tokens_1.DESIGN_TOKENS.spacing[2],
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                    border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                    boxShadow: tokens_1.DESIGN_TOKENS.shadows.large,
                    zIndex: tokens_1.DESIGN_TOKENS.zIndex.dropdown,
                    maxHeight: 240,
                    overflowY: 'auto',
                    animation: `sg-dropdown-in ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                } }, options.map((option) => (react_1.default.createElement("div", { key: option.value, role: "option", "aria-selected": selected?.value === option.value, "aria-disabled": option.disabled, onClick: () => handleSelect(option), style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens_1.DESIGN_TOKENS.spacing[3],
                    padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[4]}px`,
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: selected?.value === option.value ? tokens_1.DESIGN_TOKENS.colors.primaryLight : 'transparent',
                    color: option.disabled ? tokens_1.DESIGN_TOKENS.colors.textTertiary : tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    opacity: option.disabled ? 0.5 : 1,
                    transition: `background ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                    ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                }, onMouseEnter: (e) => { if (!option.disabled)
                    e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.elevated; }, onMouseLeave: (e) => { if (!option.disabled && selected?.value !== option.value)
                    e.currentTarget.style.background = 'transparent'; } },
                option.icon,
                option.label)))))),
        error && (react_1.default.createElement("span", { role: "alert", style: {
                ...tokens_1.DESIGN_TOKENS.typography.caption,
                color: tokens_1.DESIGN_TOKENS.colors.danger,
                marginTop: tokens_1.DESIGN_TOKENS.spacing[2],
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            } }, error))));
};
exports.Dropdown = Dropdown;
exports.Dropdown.displayName = 'Dropdown';
