"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingState = exports.NetworkError = exports.EmptyState = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const EmptyState = ({ title, description, icon, actionLabel, onAction, style }) => {
    return (react_1.default.createElement("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens_1.DESIGN_TOKENS.spacing[10],
            textAlign: 'center',
            minHeight: 240,
            ...style,
        }, role: "status", "aria-live": "polite" },
        icon && react_1.default.createElement("div", { style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[5], opacity: 0.8 } }, icon),
        react_1.default.createElement("h3", { style: {
                margin: 0,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing[3],
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                ...tokens_1.DESIGN_TOKENS.typography.headingS,
            } }, title),
        description && (react_1.default.createElement("p", { style: {
                margin: 0,
                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                maxWidth: 360,
            } }, description)),
        actionLabel && onAction && (react_1.default.createElement("button", { type: "button", onClick: onAction, style: {
                marginTop: tokens_1.DESIGN_TOKENS.spacing[6],
                padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[6]}px`,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                minHeight: 40,
            }, onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = tokens_1.DESIGN_TOKENS.colors.primaryHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
            }, onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = tokens_1.DESIGN_TOKENS.colors.primary;
                e.currentTarget.style.transform = 'translateY(0)';
            }, "aria-label": actionLabel }, actionLabel))));
};
exports.EmptyState = EmptyState;
const NetworkError = ({ onRetry, message = 'Unable to connect. Please check your internet connection.' }) => {
    return (react_1.default.createElement("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens_1.DESIGN_TOKENS.spacing[10],
            textAlign: 'center',
            minHeight: 240,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.xl,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
            margin: tokens_1.DESIGN_TOKENS.spacing[4],
        }, role: "alert", "aria-live": "assertive" },
        react_1.default.createElement("div", { style: {
                width: 64,
                height: 64,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.full,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.dangerLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: tokens_1.DESIGN_TOKENS.spacing[4],
            } },
            react_1.default.createElement("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: tokens_1.DESIGN_TOKENS.colors.danger, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                react_1.default.createElement("path", { d: "M8.5 16.5a5 5 0 0 1 7 0" }),
                react_1.default.createElement("path", { d: "M2 8.82a15 15 0 0 1 20 0" }),
                react_1.default.createElement("line", { x1: "1", y1: "1", x2: "23", y2: "23" }))),
        react_1.default.createElement("h3", { style: {
                margin: 0,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing[3],
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                ...tokens_1.DESIGN_TOKENS.typography.headingS,
            } }, "Connection Lost"),
        react_1.default.createElement("p", { style: {
                margin: 0,
                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing[5],
                maxWidth: 320,
            } }, message),
        onRetry && (react_1.default.createElement("button", { type: "button", onClick: onRetry, style: {
                padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[6]}px`,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: `all ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                minHeight: 40,
            }, onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = tokens_1.DESIGN_TOKENS.colors.primaryHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
            }, onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = tokens_1.DESIGN_TOKENS.colors.primary;
                e.currentTarget.style.transform = 'translateY(0)';
            }, "aria-label": "Retry connection" }, "Try Again"))));
};
exports.NetworkError = NetworkError;
const LoadingState = ({ count = 3, variant = 'card', label }) => {
    if (variant === 'text') {
        return (react_1.default.createElement("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing[4], display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing[3] } },
            label && react_1.default.createElement("p", { style: { ...tokens_1.DESIGN_TOKENS.typography.bodySmall, color: tokens_1.DESIGN_TOKENS.colors.textSecondary } }, label),
            Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
                    height: 16,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                    width: `${Math.max(40, Math.min(100 - i * 8, 100))}%`,
                    animation: 'sg-pulse 0.5s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                } })))));
    }
    if (variant === 'list') {
        return (react_1.default.createElement("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing[4], display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[2] } },
            label && react_1.default.createElement("p", { style: { ...tokens_1.DESIGN_TOKENS.typography.bodySmall, color: tokens_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: tokens_1.DESIGN_TOKENS.spacing[2] } }, label),
            Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing[3] } },
                react_1.default.createElement("div", { style: {
                        width: 32,
                        height: 32,
                        borderRadius: tokens_1.DESIGN_TOKENS.radius.full,
                        backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                        animation: 'sg-pulse 0.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                    } }),
                react_1.default.createElement("div", { style: {
                        height: 14,
                        backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                        borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                        flex: 1,
                        animation: 'sg-pulse 0.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1 + 0.05}s`,
                    } }))))));
    }
    return (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing[4] } },
        label && react_1.default.createElement("p", { style: { ...tokens_1.DESIGN_TOKENS.typography.bodySmall, color: tokens_1.DESIGN_TOKENS.colors.textSecondary } }, label),
        Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.borderLight}`,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.xl,
                padding: tokens_1.DESIGN_TOKENS.spacing[5],
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                animation: 'sg-pulse 0.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
            } },
            react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing[4], alignItems: 'center' } },
                react_1.default.createElement("div", { style: {
                        width: 48,
                        height: 48,
                        borderRadius: tokens_1.DESIGN_TOKENS.radius.full,
                        backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                    } }),
                react_1.default.createElement("div", { style: { flex: 1 } },
                    react_1.default.createElement("div", { style: { height: 16, backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, marginBottom: 8, width: '70%', borderRadius: tokens_1.DESIGN_TOKENS.radius.sm } }),
                    react_1.default.createElement("div", { style: { height: 14, backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '40%', borderRadius: tokens_1.DESIGN_TOKENS.radius.sm } }))),
            react_1.default.createElement("div", { style: { height: 12, backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, marginTop: tokens_1.DESIGN_TOKENS.spacing[4], borderRadius: tokens_1.DESIGN_TOKENS.radius.sm } }),
            react_1.default.createElement("div", { style: { height: 12, backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '80%', marginTop: 6, borderRadius: tokens_1.DESIGN_TOKENS.radius.sm } }),
            react_1.default.createElement("div", { style: { height: 12, backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '60%', marginTop: 6, borderRadius: tokens_1.DESIGN_TOKENS.radius.sm } }))))));
};
exports.LoadingState = LoadingState;
const pulseStyle = `
  @keyframes sg-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('loading-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = pulseStyle;
    document.head.appendChild(style);
}
