"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineAlert = exports.ToastProvider = exports.useToast = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const tokens_1 = require("./tokens");
const ToastContext = (0, react_1.createContext)(null);
const useToast = () => {
    const context = (0, react_1.useContext)(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
exports.useToast = useToast;
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const showToast = (0, react_1.useCallback)((toast) => {
        const id = Date.now().toString();
        const duration = toast.duration ?? 4000;
        const newToast = { ...toast, id, duration };
        setToasts((prev) => [...prev, newToast]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);
    const hideToast = (0, react_1.useCallback)((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    return ((0, jsx_runtime_1.jsxs)(ToastContext.Provider, { value: { showToast, hideToast }, children: [children, (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens_1.DESIGN_TOKENS.spacing.sm,
                    maxWidth: 400,
                }, children: toasts.map((toast) => ((0, jsx_runtime_1.jsxs)("div", { role: "alert", style: {
                        padding: `${tokens_1.DESIGN_TOKENS.spacing.lg}px`,
                        borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
                        backgroundColor: toast.type === 'success' ? '#e8f5e8' :
                            toast.type === 'error' ? '#fff5f5' : '#f0f0f5',
                        borderLeft: `4px solid ${toast.type === 'success' ? tokens_1.DESIGN_TOKENS.colors.success :
                            toast.type === 'error' ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.primary}`,
                        boxShadow: tokens_1.DESIGN_TOKENS.shadows.medium,
                        animation: `slideIn ${tokens_1.DESIGN_TOKENS.motion.standard}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                ...tokens_1.DESIGN_TOKENS.typography.body,
                                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                            }, children: toast.message }), toast.actionLabel && toast.onAction && ((0, jsx_runtime_1.jsx)("button", { onClick: toast.onAction, style: {
                                marginTop: tokens_1.DESIGN_TOKENS.spacing.sm,
                                padding: '4px 12px',
                                fontSize: 13,
                                border: 'none',
                                borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                                background: toast.type === 'success' ? tokens_1.DESIGN_TOKENS.colors.success :
                                    toast.type === 'error' ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.primary,
                                color: 'white',
                                cursor: 'pointer',
                            }, children: toast.actionLabel }))] }, toast.id))) })] }));
};
exports.ToastProvider = ToastProvider;
const InlineAlert = ({ type = 'info', message, onClose, }) => {
    const bgColor = type === 'success' ? '#e8f5e8' :
        type === 'error' ? '#fff5f5' : '#f0f0f5';
    const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
            backgroundColor: bgColor,
            border: `1px solid ${type === 'success' ? tokens_1.DESIGN_TOKENS.colors.success :
                type === 'error' ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.primary}66`,
            display: 'flex',
            alignItems: 'center',
            gap: tokens_1.DESIGN_TOKENS.spacing.sm,
        }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: type === 'success' ? tokens_1.DESIGN_TOKENS.colors.success :
                        type === 'error' ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                }, children: icon }), (0, jsx_runtime_1.jsx)("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    flex: 1,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                }, children: message }), onClose && ((0, jsx_runtime_1.jsx)("button", { onClick: onClose, "aria-label": "Close alert", style: {
                    border: 'none',
                    background: 'transparent',
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    cursor: 'pointer',
                    fontSize: 16,
                }, children: "\u00D7" }))] }));
};
exports.InlineAlert = InlineAlert;
