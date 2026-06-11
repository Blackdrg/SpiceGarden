"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkeletonList = exports.SkeletonCard = exports.Skeleton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
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
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            ...getDefaultSize(),
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
            borderRadius: getDefaultRadius(),
            overflow: 'hidden',
            position: 'relative',
            ...style,
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `linear-gradient(90deg, ${tokens_1.DESIGN_TOKENS.colors.elevated} 0px, ${tokens_1.DESIGN_TOKENS.colors.surface} 40px, ${tokens_1.DESIGN_TOKENS.colors.elevated} 80px)`,
                backgroundSize: '200% 100%',
                animation: `sg-shimmer ${tokens_1.DESIGN_TOKENS.motion.standard * 2}ms infinite linear`,
            } }) }));
};
exports.Skeleton = Skeleton;
const SkeletonCard = ({ count = 1 }) => ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.md }, children: Array.from({ length: count }).map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { style: {
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            borderRadius: `${tokens_1.DESIGN_TOKENS.radius.card}px`,
            padding: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.md, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(exports.Skeleton, { variant: "circular", width: 48 }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(exports.Skeleton, { height: 16, width: "70%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing.xs } }), (0, jsx_runtime_1.jsx)(exports.Skeleton, { height: 14, width: "40%" })] })] }), (0, jsx_runtime_1.jsx)(exports.Skeleton, { height: 12, style: { marginTop: tokens_1.DESIGN_TOKENS.spacing.md } }), (0, jsx_runtime_1.jsx)(exports.Skeleton, { height: 12, width: "80%" }), (0, jsx_runtime_1.jsx)(exports.Skeleton, { height: 12, width: "60%" })] }, i))) }));
exports.SkeletonCard = SkeletonCard;
const SkeletonList = ({ count = 3 }) => ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.sm }, children: Array.from({ length: count }).map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            gap: tokens_1.DESIGN_TOKENS.spacing.sm,
            alignItems: 'center',
            padding: tokens_1.DESIGN_TOKENS.spacing.sm,
        }, children: [(0, jsx_runtime_1.jsx)(exports.Skeleton, { variant: "circular", width: 32 }), (0, jsx_runtime_1.jsx)(exports.Skeleton, { height: 14, width: "60%" })] }, i))) }));
exports.SkeletonList = SkeletonList;
