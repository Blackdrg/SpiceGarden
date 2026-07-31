"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const Card = ({ children, title, subtitle, variant = 'default', style, isElevated, onClick, padding = 'md', className }) => {
    const getVariantStyles = () => {
        if (isElevated || variant === 'elevated') {
            return {
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.medium,
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            };
        }
        if (variant === 'interactive') {
            return {
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.xs,
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
                cursor: onClick ? 'pointer' : 'default',
                transition: `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
            };
        }
        if (variant === 'list') {
            return {
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.none,
                borderBottom: `1px solid ${tokens_1.DESIGN_TOKENS.colors.divider}`,
                borderRadius: 0,
            };
        }
        return {
            boxShadow: tokens_1.DESIGN_TOKENS.shadows.xs,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
        };
    };
    const getPadding = () => {
        switch (padding) {
            case 'none': return 0;
            case 'sm': return tokens_1.DESIGN_TOKENS.spacing[3];
            case 'lg': return tokens_1.DESIGN_TOKENS.spacing[6];
            default: return tokens_1.DESIGN_TOKENS.spacing[5];
        }
    };
    const cardStyle = {
        backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
        borderRadius: variant === 'list' ? 0 : `${tokens_1.DESIGN_TOKENS.radius.xl}px`,
        padding: getPadding(),
        margin: `${tokens_1.DESIGN_TOKENS.spacing[3]}px 0`,
        fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
        transition: variant === 'interactive' ? `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}` : undefined,
        ...getVariantStyles(),
        ...style,
    };
    const handleMouseEnter = (e) => {
        if (variant === 'interactive') {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = tokens_1.DESIGN_TOKENS.shadows.medium;
            e.currentTarget.style.borderColor = tokens_1.DESIGN_TOKENS.colors.border;
        }
    };
    const handleMouseLeave = (e) => {
        if (variant === 'interactive') {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = tokens_1.DESIGN_TOKENS.shadows.xs;
            e.currentTarget.style.borderColor = tokens_1.DESIGN_TOKENS.colors.borderLight;
        }
    };
    return (react_1.default.createElement("div", { style: cardStyle, onClick: onClick, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, className: className, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, onKeyDown: onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        } } : undefined },
        (title || subtitle) && (react_1.default.createElement("div", { style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[4] } },
            title && (react_1.default.createElement("h3", { style: {
                    margin: 0,
                    marginBottom: subtitle ? tokens_1.DESIGN_TOKENS.spacing[1] : 0,
                    ...tokens_1.DESIGN_TOKENS.typography.headingS,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                } }, title)),
            subtitle && (react_1.default.createElement("p", { style: {
                    margin: 0,
                    ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                } }, subtitle)))),
        react_1.default.createElement("div", { style: { ...tokens_1.DESIGN_TOKENS.typography.body } }, children)));
};
exports.Card = Card;
exports.Card.displayName = 'Card';
