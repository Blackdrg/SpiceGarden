"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const Card = ({ children, title, variant = 'default', style, isElevated }) => {
    const getVariantStyles = () => {
        if (isElevated) {
            return {
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.large,
                transform: 'translateY(0)',
            };
        }
        switch (variant) {
            case 'elevated':
                return {
                    boxShadow: tokens_1.DESIGN_TOKENS.shadows.large,
                    transform: 'translateY(0)',
                };
            case 'list':
                return {
                    boxShadow: tokens_1.DESIGN_TOKENS.shadows.small,
                };
            default:
                return {
                    boxShadow: tokens_1.DESIGN_TOKENS.shadows.small,
                };
        }
    };
    return (react_1.default.createElement("div", { style: {
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            borderRadius: `${tokens_1.DESIGN_TOKENS.radius.card}px`,
            padding: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
            margin: `${tokens_1.DESIGN_TOKENS.spacing.md}px 0`,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            transition: `all ${tokens_1.DESIGN_TOKENS.motion.standard}ms ${tokens_1.MOTION_EASING.easeInOut}`,
            fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
            ...getVariantStyles(),
            ...style,
        } },
        title && (react_1.default.createElement("h3", { style: {
                marginTop: 0,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing.md,
                ...tokens_1.DESIGN_TOKENS.typography.headingS,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary
            } }, title)),
        react_1.default.createElement("div", { style: { ...tokens_1.DESIGN_TOKENS.typography.body } }, children)));
};
exports.Card = Card;
