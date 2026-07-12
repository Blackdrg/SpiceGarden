"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineTrackingSkeleton = exports.TrackingSkeleton = exports.CheckoutSkeleton = exports.MenuListSkeleton = exports.ProductListSkeleton = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const Skeleton_1 = require("./Skeleton");
const ProductListSkeleton = ({ count = 3 }) => (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[4] } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
        display: 'flex',
        gap: tokens_1.DESIGN_TOKENS.spacing[4],
        backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
        borderRadius: tokens_1.DESIGN_TOKENS.radius.xl,
        padding: tokens_1.DESIGN_TOKENS.spacing[4],
        border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
    } },
    react_1.default.createElement(Skeleton_1.Skeleton, { variant: "rectangular", width: 80, height: 80, borderRadius: tokens_1.DESIGN_TOKENS.radius.lg }),
    react_1.default.createElement("div", { style: { flex: 1 } },
        react_1.default.createElement(Skeleton_1.Skeleton, { height: 16, width: "70%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[2] } }),
        react_1.default.createElement(Skeleton_1.Skeleton, { height: 14, width: "40%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[3] } }),
        react_1.default.createElement(Skeleton_1.Skeleton, { height: 12, width: "60%" })),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 24, width: 60 }))))));
exports.ProductListSkeleton = ProductListSkeleton;
const MenuListSkeleton = ({ count = 4 }) => (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[4] } },
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 24, width: "40%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[3] } }),
    Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
            display: 'flex',
            gap: tokens_1.DESIGN_TOKENS.spacing[4],
            alignItems: 'flex-start',
        } },
        react_1.default.createElement(Skeleton_1.Skeleton, { variant: "rectangular", width: 60, height: 60, borderRadius: tokens_1.DESIGN_TOKENS.radius.lg }),
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 16, width: "80%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[2] } }),
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 14, width: "60%" })))))));
exports.MenuListSkeleton = MenuListSkeleton;
const CheckoutSkeleton = ({ itemCount = 2 }) => (react_1.default.createElement("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing[5] } },
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 28, width: "60%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[5] } }),
    react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[3], marginBottom: tokens_1.DESIGN_TOKENS.spacing[5] } }, Array.from({ length: itemCount }).map((_, i) => (react_1.default.createElement("div", { key: i, style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing[4], alignItems: 'center' } },
        react_1.default.createElement(Skeleton_1.Skeleton, { variant: "rectangular", width: 60, height: 60, borderRadius: tokens_1.DESIGN_TOKENS.radius.lg }),
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 14, width: "60%", style: { marginBottom: 4 } }),
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 12, width: "40%" })),
        react_1.default.createElement(Skeleton_1.Skeleton, { height: 16, width: 50 }))))),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 1, width: "100%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[5] } }),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 16, width: "100%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[2] } }),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 16, width: "80%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[2] } }),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 16, width: "60%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[6] } }),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 48, width: "100%", borderRadius: tokens_1.DESIGN_TOKENS.radius.lg })));
exports.CheckoutSkeleton = CheckoutSkeleton;
const TrackingSkeleton = ({ stages = 4 }) => (react_1.default.createElement("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing[5] } },
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 28, width: "50%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[5] } }),
    react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[4], marginBottom: tokens_1.DESIGN_TOKENS.spacing[6] } }, Array.from({ length: stages }).map((_, i) => (react_1.default.createElement("div", { key: i, style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing[4], alignItems: 'center' } },
        react_1.default.createElement(Skeleton_1.Skeleton, { variant: "circular", width: 32, height: 32 }),
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 14, width: "50%", style: { marginBottom: 4 } }),
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 12, width: "70%" })))))),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 120, width: "100%", borderRadius: tokens_1.DESIGN_TOKENS.radius.lg, style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[5] } }),
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 48, width: "100%", borderRadius: tokens_1.DESIGN_TOKENS.radius.lg })));
exports.TrackingSkeleton = TrackingSkeleton;
const TimelineTrackingSkeleton = ({ stages = 4 }) => (react_1.default.createElement("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing[5] } },
    react_1.default.createElement(Skeleton_1.Skeleton, { height: 28, width: "40%", style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[5] } }),
    react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[5] } }, Array.from({ length: stages }).map((_, i) => (react_1.default.createElement("div", { key: i, style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing[4] } },
        react_1.default.createElement(Skeleton_1.Skeleton, { variant: "circular", width: 40, height: 40 }),
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 14, width: "60%", style: { marginBottom: 6 } }),
            react_1.default.createElement(Skeleton_1.Skeleton, { height: 12, width: "40%" }))))))));
exports.TimelineTrackingSkeleton = TimelineTrackingSkeleton;
