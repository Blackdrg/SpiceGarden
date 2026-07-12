"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineAlert = exports.ToastProvider = exports.useToast = void 0;
const react_1 = __importStar(require("react"));
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
const ToastIcon = ({ type }) => {
    switch (type) {
        case 'success':
            return (react_1.default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", style: { flexShrink: 0 } },
                react_1.default.createElement("circle", { cx: "10", cy: "10", r: "10", fill: tokens_1.DESIGN_TOKENS.colors.successLight }),
                react_1.default.createElement("path", { d: "M6.5 10.5L9 13L13.5 7.5", stroke: tokens_1.DESIGN_TOKENS.colors.success, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })));
        case 'error':
            return (react_1.default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", style: { flexShrink: 0 } },
                react_1.default.createElement("circle", { cx: "10", cy: "10", r: "10", fill: tokens_1.DESIGN_TOKENS.colors.dangerLight }),
                react_1.default.createElement("path", { d: "M7 7L13 13M13 7L7 13", stroke: tokens_1.DESIGN_TOKENS.colors.danger, strokeWidth: "2", strokeLinecap: "round" })));
        case 'warning':
            return (react_1.default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", style: { flexShrink: 0 } },
                react_1.default.createElement("circle", { cx: "10", cy: "10", r: "10", fill: tokens_1.DESIGN_TOKENS.colors.warningLight }),
                react_1.default.createElement("path", { d: "M10 7V11M10 14V14.5", stroke: tokens_1.DESIGN_TOKENS.colors.warning, strokeWidth: "2", strokeLinecap: "round" })));
        default:
            return (react_1.default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", style: { flexShrink: 0 } },
                react_1.default.createElement("circle", { cx: "10", cy: "10", r: "10", fill: tokens_1.DESIGN_TOKENS.colors.infoLight }),
                react_1.default.createElement("path", { d: "M10 7V10M10 13.5V14", stroke: tokens_1.DESIGN_TOKENS.colors.info, strokeWidth: "2", strokeLinecap: "round" })));
    }
};
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const showToast = (0, react_1.useCallback)((toast) => {
        const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
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
    return (react_1.default.createElement(ToastContext.Provider, { value: { showToast, hideToast } },
        children,
        react_1.default.createElement("div", { style: {
                position: 'fixed',
                top: tokens_1.DESIGN_TOKENS.spacing[5],
                right: tokens_1.DESIGN_TOKENS.spacing[5],
                zIndex: tokens_1.DESIGN_TOKENS.zIndex.toast,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens_1.DESIGN_TOKENS.spacing[3],
                maxWidth: 420,
                width: 'calc(100% - 40px)',
                pointerEvents: 'none',
            } }, toasts.map((toast) => (react_1.default.createElement("div", { key: toast.id, role: "alert", style: {
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens_1.DESIGN_TOKENS.spacing[3],
                padding: `${tokens_1.DESIGN_TOKENS.spacing[4]}px ${tokens_1.DESIGN_TOKENS.spacing[5]}px`,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.large,
                animation: `sg-toast-in ${tokens_1.DESIGN_TOKENS.motion.standard}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                pointerEvents: 'auto',
            } },
            react_1.default.createElement(ToastIcon, { type: toast.type }),
            react_1.default.createElement("div", { style: { flex: 1, minWidth: 0 } },
                react_1.default.createElement("span", { style: {
                        ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                        display: 'block',
                    } }, toast.message),
                toast.actionLabel && toast.onAction && (react_1.default.createElement("button", { onClick: toast.onAction, style: {
                        marginTop: tokens_1.DESIGN_TOKENS.spacing[2],
                        padding: `${tokens_1.DESIGN_TOKENS.spacing[1]}px ${tokens_1.DESIGN_TOKENS.spacing[3]}px`,
                        fontSize: 13,
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                        background: tokens_1.DESIGN_TOKENS.colors.primary,
                        color: 'white',
                        cursor: 'pointer',
                        transition: `background ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                    }, onMouseEnter: (e) => { e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.primaryHover; }, onMouseLeave: (e) => { e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.primary; } }, toast.actionLabel))),
            react_1.default.createElement("button", { onClick: () => hideToast(toast.id), "aria-label": "Dismiss notification", style: {
                    border: 'none',
                    background: 'transparent',
                    color: tokens_1.DESIGN_TOKENS.colors.textTertiary,
                    cursor: 'pointer',
                    fontSize: 18,
                    padding: 2,
                    lineHeight: 1,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `color ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                    flexShrink: 0,
                }, onMouseEnter: (e) => { e.currentTarget.style.color = tokens_1.DESIGN_TOKENS.colors.textSecondary; }, onMouseLeave: (e) => { e.currentTarget.style.color = tokens_1.DESIGN_TOKENS.colors.textTertiary; } }, "\u00D7")))))));
};
exports.ToastProvider = ToastProvider;
const InlineAlert = ({ type = 'info', message, onClose, }) => {
    const bgColors = {
        success: tokens_1.DESIGN_TOKENS.colors.successLight,
        error: tokens_1.DESIGN_TOKENS.colors.dangerLight,
        warning: tokens_1.DESIGN_TOKENS.colors.warningLight,
        info: tokens_1.DESIGN_TOKENS.colors.infoLight,
    };
    const borderColors = {
        success: tokens_1.DESIGN_TOKENS.colors.success,
        error: tokens_1.DESIGN_TOKENS.colors.danger,
        warning: tokens_1.DESIGN_TOKENS.colors.warning,
        info: tokens_1.DESIGN_TOKENS.colors.info,
    };
    return (react_1.default.createElement("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens_1.DESIGN_TOKENS.spacing[3],
            padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[4]}px`,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
            backgroundColor: bgColors[type],
            border: `1px solid ${borderColors[type]}33`,
        } },
        react_1.default.createElement(ToastIcon, { type: type }),
        react_1.default.createElement("span", { style: {
                ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
                flex: 1,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
            } }, message),
        onClose && (react_1.default.createElement("button", { onClick: onClose, "aria-label": "Close alert", style: {
                border: 'none',
                background: 'transparent',
                color: tokens_1.DESIGN_TOKENS.colors.textTertiary,
                cursor: 'pointer',
                fontSize: 18,
                padding: 2,
                lineHeight: 1,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: `color ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                flexShrink: 0,
            }, onMouseEnter: (e) => { e.currentTarget.style.color = tokens_1.DESIGN_TOKENS.colors.textSecondary; }, onMouseLeave: (e) => { e.currentTarget.style.color = tokens_1.DESIGN_TOKENS.colors.textTertiary; } }, "\u00D7"))));
};
exports.InlineAlert = InlineAlert;
