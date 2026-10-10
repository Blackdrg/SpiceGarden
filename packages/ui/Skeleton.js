"use client";
import React from 'react';
import { DESIGN_TOKENS } from './tokens';
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
export const Skeleton = ({ width, height = 16, borderRadius, variant = 'rectangular', style, }) => {
    const getDefaultRadius = () => {
        if (borderRadius)
            return borderRadius;
        if (variant === 'circular')
            return 9999;
        if (variant === 'text')
            return DESIGN_TOKENS.radius.sm;
        return DESIGN_TOKENS.radius.md;
    };
    const getDefaultSize = () => {
        if (variant === 'circular') {
            const size = typeof width === 'number' ? width : 40;
            return { width: size, height: size };
        }
        return { width: width || '100%', height };
    };
    return (React.createElement("div", { style: {
            ...getDefaultSize(),
            backgroundColor: DESIGN_TOKENS.colors.elevated,
            borderRadius: getDefaultRadius(),
            overflow: 'hidden',
            position: 'relative',
            ...style,
        } },
        React.createElement("div", { style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `linear-gradient(90deg, ${DESIGN_TOKENS.colors.elevated} 0px, ${DESIGN_TOKENS.colors.surface} 40px, ${DESIGN_TOKENS.colors.elevated} 80px)`,
                backgroundSize: '200% 100%',
                animation: `sg-shimmer ${DESIGN_TOKENS.motion.standard * 2}ms infinite linear`,
            } })));
};
export const SkeletonCard = ({ count = 1 }) => (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md } }, Array.from({ length: count }).map((_, i) => (React.createElement("div", { key: i, style: {
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
        borderRadius: `${DESIGN_TOKENS.radius.card}px`,
        padding: `${DESIGN_TOKENS.spacing.lg}px`,
        backgroundColor: DESIGN_TOKENS.colors.surface,
    } },
    React.createElement("div", { style: { display: 'flex', gap: DESIGN_TOKENS.spacing.md, alignItems: 'center' } },
        React.createElement(Skeleton, { variant: "circular", width: 48 }),
        React.createElement("div", { style: { flex: 1 } },
            React.createElement(Skeleton, { height: 16, width: "70%", style: { marginBottom: DESIGN_TOKENS.spacing.xs } }),
            React.createElement(Skeleton, { height: 14, width: "40%" }))),
    React.createElement(Skeleton, { height: 12, style: { marginTop: DESIGN_TOKENS.spacing.md } }),
    React.createElement(Skeleton, { height: 12, width: "80%" }),
    React.createElement(Skeleton, { height: 12, width: "60%" }))))));
export const SkeletonList = ({ count = 3 }) => (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm } }, Array.from({ length: count }).map((_, i) => (React.createElement("div", { key: i, style: {
        display: 'flex',
        gap: DESIGN_TOKENS.spacing.sm,
        alignItems: 'center',
        padding: DESIGN_TOKENS.spacing.sm,
    } },
    React.createElement(Skeleton, { variant: "circular", width: 32 }),
    React.createElement(Skeleton, { height: 14, width: "60%" }))))));
