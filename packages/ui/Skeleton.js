"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkeletonList = exports.SkeletonCard = exports.Skeleton = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
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
const Skeleton = ({ width, height = 16, borderRadius, variant = 'rectangular', style, }) => {
    const getDefaultRadius = () => {
        if (borderRadius)
            return borderRadius;
        if (variant === 'circular')
            return 9999;
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
    return (react_1.default.createElement("div", { style: {
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
                backgroundImage: `linear-gradient(90deg, ${tokens_1.DESIGN_TOKENS.colors.elevated} 0px, ${tokens_1.DESIGN_TOKENS.colors.surface} 40px, ${tokens_1.DESIGN_TOKENS.colors.elevated} 80px)`,
                backgroundSize: '200% 100%',
                animation: `sg-shimmer ${tokens_1.DESIGN_TOKENS.motion.standard * 2}ms infinite linear`,
            } })));
};
exports.Skeleton = Skeleton;
const SkeletonCard = ({ count = 1 }) => (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.md } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
        border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
        borderRadius: `${tokens_1.DESIGN_TOKENS.radius.card}px`,
        padding: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
        backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
    } },
    react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.md, alignItems: 'center' } },
        react_1.default.createElement(exports.Skeleton, { variant: "circular", width: 48 }),
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement(exports.Skeleton, { height: 16, width: "70%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing.xs } }),
            react_1.default.createElement(exports.Skeleton, { height: 14, width: "40%" }))),
    react_1.default.createElement(exports.Skeleton, { height: 12, style: { marginTop: tokens_1.DESIGN_TOKENS.spacing.md } }),
    react_1.default.createElement(exports.Skeleton, { height: 12, width: "80%" }),
    react_1.default.createElement(exports.Skeleton, { height: 12, width: "60%" }))))));
exports.SkeletonCard = SkeletonCard;
const SkeletonList = ({ count = 3 }) => (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.sm } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
        display: 'flex',
        gap: tokens_1.DESIGN_TOKENS.spacing.sm,
        alignItems: 'center',
        padding: tokens_1.DESIGN_TOKENS.spacing.sm,
    } },
    react_1.default.createElement(exports.Skeleton, { variant: "circular", width: 32 }),
    react_1.default.createElement(exports.Skeleton, { height: 14, width: "60%" }))))));
exports.SkeletonList = SkeletonList;
