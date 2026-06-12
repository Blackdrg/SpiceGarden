"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingState = exports.NetworkError = exports.EmptyState = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const tokens_1 = require("./tokens");
const EmptyState = ({ title, description, icon, actionLabel, onAction, style }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens_1.DESIGN_TOKENS.spacing.xl,
            textAlign: 'center',
            minHeight: '200px',
            ...style,
        }, role: "status", "aria-live": "polite", children: [icon && (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg, opacity: 0.5 }, children: icon }), (0, jsx_runtime_1.jsx)("h3", { style: {
                    margin: 0,
                    marginBottom: tokens_1.DESIGN_TOKENS.spacing.sm,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    ...tokens_1.DESIGN_TOKENS.typography.headingS
                }, children: title }), description && ((0, jsx_runtime_1.jsx)("p", { style: {
                    margin: 0,
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    ...tokens_1.DESIGN_TOKENS.typography.body
                }, children: description })), actionLabel && onAction && ((0, jsx_runtime_1.jsx)("button", { onClick: onAction, style: {
                    marginTop: tokens_1.DESIGN_TOKENS.spacing.lg,
                    padding: `${tokens_1.DESIGN_TOKENS.spacing.sm}px ${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                }, "aria-label": actionLabel, children: actionLabel }))] }));
};
exports.EmptyState = EmptyState;
const NetworkError = ({ onRetry, message = 'Unable to connect. Please check your internet connection.' }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
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
        }, role: "alert", "aria-live": "assertive", children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '48px', marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg }, children: "\uD83D\uDCF6" }), (0, jsx_runtime_1.jsx)("h3", { style: {
                    margin: 0,
                    marginBottom: tokens_1.DESIGN_TOKENS.spacing.sm,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary
                }, children: "Connection Lost" }), (0, jsx_runtime_1.jsx)("p", { style: {
                    margin: 0,
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg
                }, children: message }), onRetry && ((0, jsx_runtime_1.jsx)("button", { onClick: onRetry, style: {
                    padding: `${tokens_1.DESIGN_TOKENS.spacing.sm}px ${tokens_1.DESIGN_TOKENS.spacing.xl}px`,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                }, "aria-label": "Retry connection", children: "Try Again" }))] }));
};
exports.NetworkError = NetworkError;
const LoadingState = ({ count = 3, variant = 'card' }) => {
    if (variant === 'text') {
        return ((0, jsx_runtime_1.jsx)("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing.md }, children: Array.from({ length: count }).map((_, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                    height: '16px',
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                    marginBottom: tokens_1.DESIGN_TOKENS.spacing.xs,
                    width: `${Math.random() * 40 + 60}%`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                } }, i))) }));
    }
    if (variant === 'list') {
        return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.sm }, children: Array.from({ length: count }).map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.sm }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        } }), (0, jsx_runtime_1.jsx)("div", { style: {
                            height: '14px',
                            backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                            borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                            flex: 1,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        } })] }, i))) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: tokens_1.DESIGN_TOKENS.spacing.md }, children: Array.from({ length: count }).map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                borderRadius: `${tokens_1.DESIGN_TOKENS.radius.card}px`,
                padding: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                animation: 'pulse 1.5s ease-in-out infinite',
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.md, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated,
                            } }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { height: '16px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, marginBottom: 8, width: '70%' } }), (0, jsx_runtime_1.jsx)("div", { style: { height: '14px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '40%' } })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: '12px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, marginTop: tokens_1.DESIGN_TOKENS.spacing.md } }), (0, jsx_runtime_1.jsx)("div", { style: { height: '12px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '80%', marginTop: 4 } }), (0, jsx_runtime_1.jsx)("div", { style: { height: '12px', backgroundColor: tokens_1.DESIGN_TOKENS.colors.elevated, width: '60%', marginTop: 4 } })] }, i))) }));
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
