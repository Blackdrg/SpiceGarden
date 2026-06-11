"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const tokens_1 = require("./tokens");
const Button = ({ label, children, onClick, variant = 'primary', size = 'md', isLoading = false, disabled = false, style, ariaLabel, }) => {
    const getBgColor = () => {
        switch (variant) {
            case 'primary': return tokens_1.DESIGN_TOKENS.colors.primary;
            case 'secondary': return tokens_1.DESIGN_TOKENS.colors.surface;
            case 'ghost': return 'transparent';
            case 'outline': return 'transparent';
            case 'destructive': return tokens_1.DESIGN_TOKENS.colors.danger;
            case 'loading': return tokens_1.DESIGN_TOKENS.colors.textSecondary;
            default: return tokens_1.DESIGN_TOKENS.colors.primary;
        }
    };
    const getTextColor = () => {
        if (variant === 'primary' || variant === 'destructive' || variant === 'loading') {
            return tokens_1.DESIGN_TOKENS.colors.textInverse;
        }
        if (variant === 'outline') {
            return tokens_1.DESIGN_TOKENS.colors.primary;
        }
        return tokens_1.DESIGN_TOKENS.colors.textPrimary;
    };
    const getBorder = () => {
        if (variant === 'outline' || variant === 'ghost') {
            return `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`;
        }
        return 'none';
    };
    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return { padding: '6px 12px', fontSize: 14 };
            case 'lg': return { padding: '16px 24px', fontSize: 18 };
            default: return { padding: '10px 20px', fontSize: 16 };
        }
    };
    const isDisabled = disabled || isLoading;
    return ((0, jsx_runtime_1.jsx)("button", { onClick: onClick, disabled: isDisabled, "aria-label": ariaLabel || label, "aria-disabled": isDisabled, style: {
            backgroundColor: getBgColor(),
            color: getTextColor(),
            border: getBorder(),
            borderRadius: `${tokens_1.DESIGN_TOKENS.radius.button}px`,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            transition: `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
            opacity: isDisabled ? 0.6 : 1,
            fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
            fontWeight: 600,
            fontSize: getSizeStyles().fontSize,
            padding: getSizeStyles().padding,
            boxShadow: variant === 'primary' ? tokens_1.DESIGN_TOKENS.shadows.small : 'none',
            ...style,
        }, children: isLoading ? 'Loading...' : label }));
};
exports.Button = Button;
