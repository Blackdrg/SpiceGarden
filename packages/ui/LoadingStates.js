"use strict";
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
            padding: tokens_1.DESIGN_TOKENS.spacing.xl,
            textAlign: 'center',
            minHeight: '200px',
            ...style,
        }, role: "status", "aria-live": "polite" },
        icon && react_1.default.createElement("div", { style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg, opacity: 0.5 } }, icon),
        react_1.default.createElement("h3", { style: {
                margin: 0,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing.sm,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                ...tokens_1.DESIGN_TOKENS.typography.headingS
            } }, title),
        description && (react_1.default.createElement("p", { style: {
                margin: 0,
                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                ...tokens_1.DESIGN_TOKENS.typography.body
            } }, description)),
        actionLabel && onAction && (react_1.default.createElement("button", { onClick: onAction, style: {
                marginTop: tokens_1.DESIGN_TOKENS.spacing.lg,
                padding: `${tokens_1.DESIGN_TOKENS.spacing.sm}px ${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
            }, "aria-label": actionLabel }, actionLabel))));
};
exports.EmptyState = EmptyState;
const NetworkError = ({ onRetry, message = 'Unable to connect. Please check your internet connection.' }) => {
    return (react_1.default.createElement("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens_1.DESIGN_TOKENS.spacing.xl,
            textAlign: 'center',
            minHeight: '200px',
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            margin: tokens_1.DESIGN_TOKENS.spacing.md,
        }, role: "alert", "aria-live": "assertive" },
        react_1.default.createElement("div", { style: { fontSize: '48px', marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg } }, "\uD83D\uDCF6"),
        react_1.default.createElement("h3", { style: {
                margin: 0,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing.sm,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary
            } }, "Connection Lost"),
        react_1.default.createElement("p", { style: {
                margin: 0,
                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg
            } }, message),
        onRetry && (react_1.default.createElement("button", { onClick: onRetry, style: {
                padding: `${tokens_1.DESIGN_TOKENS.spacing.sm}px ${tokens_1.DESIGN_TOKENS.spacing.xl}px`,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
            }, "aria-label": "Retry connection" }, "Try Again"))));
};
exports.NetworkError = NetworkError;
const LoadingState = ({ count = 3, variant = 'card' }) => {
    if (variant === 'text') {
        return (react_1.default.createElement("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing.md } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
                height: '16px',
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                marginBottom: tokens_1.DESIGN_TOKENS.spacing.xs,
                width: `${Math.random() * 40 + 60}%`,
                animation: 'pulse 1.5s ease-in-out infinite',
            } })))));
    }
    if (variant === 'list') {
        return (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.sm } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.sm } },
            react_1.default.createElement("div", { style: {
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                    animation: 'pulse 1.5s ease-in-out infinite',
                } }),
            react_1.default.createElement("div", { style: {
                    height: '14px',
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                    flex: 1,
                    animation: 'pulse 1.5s ease-in-out infinite',
                } }))))));
    }
    return (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.md } }, Array.from({ length: count }).map((_, i) => (react_1.default.createElement("div", { key: i, style: {
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            borderRadius: `${tokens_1.DESIGN_TOKENS.radius.card}px`,
            padding: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            animation: 'pulse 1.5s ease-in-out infinite',
        } },
        react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.md, alignItems: 'center' } },
            react_1.default.createElement("div", { style: {
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                } }),
            react_1.default.createElement("div", { style: { flex: 1 } },
                react_1.default.createElement("div", { style: { height: '16px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, marginBottom: 8, width: '70%' } }),
                react_1.default.createElement("div", { style: { height: '14px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '40%' } }))),
        react_1.default.createElement("div", { style: { height: '12px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, marginTop: tokens_1.DESIGN_TOKENS.spacing.md } }),
        react_1.default.createElement("div", { style: { height: '12px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '80%', marginTop: 4 } }),
        react_1.default.createElement("div", { style: { height: '12px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '60%', marginTop: 4 } }))))));
};
exports.LoadingState = LoadingState;
const pulseStyle = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('loading-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = pulseStyle;
    document.head.appendChild(style);
}
