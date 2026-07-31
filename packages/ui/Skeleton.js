"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkeletonList = exports.SkeletonCard = exports.Skeleton = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const Skeleton = ({ width, height = 16, borderRadius, variant = 'rectangular', style, className, }) => {
    const getDefaultRadius = () => {
        if (borderRadius)
            return borderRadius;
        if (variant === 'circular')
            return tokens_1.DESIGN_TOKENS.radius.full;
        if (variant === 'text')
            return tokens_1.DESIGN_TOKENS.radius.sm;
        return tokens_1.DESIGN_TOKENS.radius.md;
    };
    const getDefaultSize = () => {
        if (variant === 'circular') {
            const size = typeof width === 'number' ? width : 40;
            return { width: size, height: size };
        }
        return { width: width || '100%', height };
    };
    return (react_1.default.createElement("div", { className: className, style: {
            ...getDefaultSize(),
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
            borderRadius: getDefaultRadius(),
            overflow: 'hidden',
            position: 'relative',
            ...style,
        } },
        react_1.default.createElement("div", { style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `linear-gradient(90deg, ${tokens_1.DESIGN_TOKENS.colors.elevated} 0%, ${tokens_1.DESIGN_TOKENS.colors.gray200} 40px, ${tokens_1.DESIGN_TOKENS.colors.elevated} 80px)`,
                backgroundSize: '200% 100%',
                animation: `sg-shimmer ${tokens_1.DESIGN_TOKENS.motion.slow}ms infinite linear`,
            } })));
};
exports.Skeleton = Skeleton;
const SkeletonCard = ({ count = 1 }) => (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[4] } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens_1.DESIGN_TOKENS.spacing[3],
        padding: tokens_1.DESIGN_TOKENS.spacing[5],
        backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
        borderRadius: tokens_1.DESIGN_TOKENS.radius.xl,
        border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
    } },
    react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing[4], alignItems: 'center' } },
        react_1.default.createElement(exports.Skeleton, { variant: "circular", width: 48, height: 48 }),
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement(exports.Skeleton, { height: 16, width: "70%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[2] } }),
            react_1.default.createElement(exports.Skeleton, { height: 14, width: "40%" }))),
    react_1.default.createElement(exports.Skeleton, { height: 12 }),
    react_1.default.createElement(exports.Skeleton, { height: 12, width: "80%" }),
    react_1.default.createElement(exports.Skeleton, { height: 12, width: "60%" }))))));
exports.SkeletonCard = SkeletonCard;
const SkeletonList = ({ count = 3 }) => (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[2] } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
        display: 'flex',
        gap: tokens_1.DESIGN_TOKENS.spacing[3],
        alignItems: 'center',
        padding: tokens_1.DESIGN_TOKENS.spacing[3],
    } },
    react_1.default.createElement(exports.Skeleton, { variant: "circular", width: 32, height: 32 }),
    react_1.default.createElement(exports.Skeleton, { height: 14, width: "60%" }))))));
exports.SkeletonList = SkeletonList;
const shimmerStyle = `
  @keyframes sg-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('sg-skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'sg-skeleton-styles';
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
}
