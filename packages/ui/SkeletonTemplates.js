"use client";
import React from 'react';
import { DESIGN_TOKENS } from './tokens';
import { Skeleton } from './Skeleton';
export const ProductListSkeleton = ({ count = 3 }) => (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg } }, Array.from({ length: count }).map((_, i) => (React.createElement("div", { key: i, style: {
        display: 'flex',
        gap: DESIGN_TOKENS.spacing.md,
        backgroundColor: DESIGN_TOKENS.colors.surface,
        borderRadius: DESIGN_TOKENS.radius.card,
        padding: DESIGN_TOKENS.spacing.lg,
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
    } },
    React.createElement(Skeleton, { variant: "rectangular", width: 80, height: 80, borderRadius: 12 }),
    React.createElement("div", { style: { flex: 1 } },
        React.createElement(Skeleton, { height: 16, width: "70%", style: { marginBottom: DESIGN_TOKENS.spacing.sm } }),
        React.createElement(Skeleton, { height: 14, width: "40%", style: { marginBottom: DESIGN_TOKENS.spacing.md } }),
        React.createElement(Skeleton, { height: 12, width: "60%" })),
    React.createElement(Skeleton, { height: 20, width: 60 }))))));
export const MenuListSkeleton = ({ count = 4 }) => (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg } },
    React.createElement(Skeleton, { height: 24, width: "40%", style: { marginBottom: DESIGN_TOKENS.spacing.md } }),
    Array.from({ length: count }).map((_, i) => (React.createElement("div", { key: i, style: {
            display: 'flex',
            gap: DESIGN_TOKENS.spacing.md,
            alignItems: 'flex-start',
        } },
        React.createElement(Skeleton, { variant: "rectangular", width: 60, height: 60, borderRadius: 12 }),
        React.createElement("div", { style: { flex: 1 } },
            React.createElement(Skeleton, { height: 16, width: "80%", style: { marginBottom: DESIGN_TOKENS.spacing.sm } }),
            React.createElement(Skeleton, { height: 14, width: "60%" })))))));
export const CheckoutSkeleton = ({ itemCount = 2 }) => (React.createElement("div", { style: { padding: DESIGN_TOKENS.spacing.lg } },
    React.createElement(Skeleton, { height: 24, width: "60%", style: { marginBottom: DESIGN_TOKENS.spacing.lg } }),
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md, marginBottom: DESIGN_TOKENS.spacing.lg } }, Array.from({ length: itemCount }).map((_, i) => (React.createElement("div", { key: i, style: { display: 'flex', gap: DESIGN_TOKENS.spacing.md, alignItems: 'center' } },
        React.createElement(Skeleton, { variant: "rectangular", width: 60, height: 60, borderRadius: 12 }),
        React.createElement("div", { style: { flex: 1 } },
            React.createElement(Skeleton, { height: 14, width: "60%", style: { marginBottom: 4 } }),
            React.createElement(Skeleton, { height: 12, width: "40%" })),
        React.createElement(Skeleton, { height: 16, width: 50 }))))),
    React.createElement(Skeleton, { height: 1, width: "100%", style: { marginBottom: DESIGN_TOKENS.spacing.lg } }),
    React.createElement(Skeleton, { height: 16, width: "100%", style: { marginBottom: DESIGN_TOKENS.spacing.sm } }),
    React.createElement(Skeleton, { height: 16, width: "80%", style: { marginBottom: DESIGN_TOKENS.spacing.sm } }),
    React.createElement(Skeleton, { height: 16, width: "60%", style: { marginBottom: DESIGN_TOKENS.spacing.xl } }),
    React.createElement(Skeleton, { height: 48, width: "100%", borderRadius: 12 })));
export const TrackingSkeleton = ({ stages = 4 }) => (React.createElement("div", { style: { padding: DESIGN_TOKENS.spacing.lg } },
    React.createElement(Skeleton, { height: 24, width: "50%", style: { marginBottom: DESIGN_TOKENS.spacing.lg } }),
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg, marginBottom: DESIGN_TOKENS.spacing.xl } }, Array.from({ length: stages }).map((_, i) => (React.createElement("div", { key: i, style: { display: 'flex', gap: DESIGN_TOKENS.spacing.md, alignItems: 'center' } },
        React.createElement(Skeleton, { variant: "circular", width: 32, height: 32 }),
        React.createElement("div", { style: { flex: 1 } },
            React.createElement(Skeleton, { height: 14, width: "50%", style: { marginBottom: 4 } }),
            React.createElement(Skeleton, { height: 12, width: "70%" })))))),
    React.createElement(Skeleton, { height: 120, width: "100%", borderRadius: 12, style: { marginBottom: DESIGN_TOKENS.spacing.lg } }),
    React.createElement(Skeleton, { height: 48, width: "100%", borderRadius: 12 })));
export const TimelineTrackingSkeleton = ({ stages = 4 }) => (React.createElement("div", { style: { padding: DESIGN_TOKENS.spacing.lg } },
    React.createElement(Skeleton, { height: 24, width: "40%", style: { marginBottom: DESIGN_TOKENS.spacing.lg } }),
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.xl } }, Array.from({ length: stages }).map((_, i) => (React.createElement("div", { key: i, style: { display: 'flex', gap: DESIGN_TOKENS.spacing.md } },
        React.createElement(Skeleton, { variant: "circular", width: 40, height: 40 }),
        React.createElement("div", { style: { flex: 1 } },
            React.createElement(Skeleton, { height: 14, width: "60%", style: { marginBottom: 6 } }),
            React.createElement(Skeleton, { height: 12, width: "40%" }))))))));
