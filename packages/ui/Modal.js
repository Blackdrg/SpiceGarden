"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottomSheet = exports.Modal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const tokens_1 = require("./tokens");
const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, }) => {
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    const maxWidth = size === 'sm' ? 400 : size === 'lg' ? 700 : 500;
    return ((0, jsx_runtime_1.jsxs)("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: `fadeIn ${tokens_1.DESIGN_TOKENS.motion.page}ms ${tokens_1.MOTION_EASING.easeInOut}`,
        }, onClick: onClose, children: [(0, jsx_runtime_1.jsxs)("div", { onClick: (e) => e.stopPropagation(), style: {
                    background: tokens_1.DESIGN_TOKENS.colors.surface,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
                    padding: tokens_1.DESIGN_TOKENS.spacing.lg,
                    maxWidth,
                    width: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    boxShadow: tokens_1.DESIGN_TOKENS.shadows.large,
                    animation: `slideUp ${tokens_1.DESIGN_TOKENS.motion.page}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                }, children: [title && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg,
                        }, children: [(0, jsx_runtime_1.jsx)("h2", { id: "modal-title", style: {
                                    margin: 0,
                                    ...tokens_1.DESIGN_TOKENS.typography.headingM,
                                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                                }, children: title }), showCloseButton && ((0, jsx_runtime_1.jsx)("button", { onClick: onClose, "aria-label": "Close modal", style: {
                                    border: 'none',
                                    background: 'transparent',
                                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                                    cursor: 'pointer',
                                    fontSize: 24,
                                }, children: "\u00D7" }))] })), children] }), (0, jsx_runtime_1.jsx)("style", { children: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      ` })] }));
};
exports.Modal = Modal;
const BottomSheet = ({ isOpen, onClose, title, children, showCloseButton = true, }) => {
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { role: "dialog", "aria-modal": "true", style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 10000,
        }, onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { onClick: (e) => e.stopPropagation(), style: {
                background: tokens_1.DESIGN_TOKENS.colors.surface,
                borderTopLeftRadius: tokens_1.DESIGN_TOKENS.radius.card,
                borderTopRightRadius: tokens_1.DESIGN_TOKENS.radius.card,
                padding: tokens_1.DESIGN_TOKENS.spacing.lg,
                width: '100%',
                maxWidth: 500,
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.large,
                animation: `slideUp ${tokens_1.DESIGN_TOKENS.motion.page}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        width: 40,
                        height: 4,
                        background: tokens_1.DESIGN_TOKENS.colors.border,
                        borderRadius: 2,
                        margin: '0 auto 16px',
                    } }), title && ((0, jsx_runtime_1.jsx)("h2", { style: {
                        margin: '0 0 16px 0',
                        ...tokens_1.DESIGN_TOKENS.typography.headingM,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    }, children: title })), children, showCloseButton && ((0, jsx_runtime_1.jsx)("button", { onClick: onClose, "aria-label": "Close sheet", style: {
                        marginTop: tokens_1.DESIGN_TOKENS.spacing.lg,
                        width: '100%',
                        padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                        border: 'none',
                        borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                        background: tokens_1.DESIGN_TOKENS.colors.primary,
                        color: 'white',
                        ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                        cursor: 'pointer',
                    }, children: "Done" }))] }) }));
};
exports.BottomSheet = BottomSheet;
