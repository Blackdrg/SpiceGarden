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
exports.BottomSheet = exports.Modal = void 0;
const react_1 = __importStar(require("react"));
const tokens_1 = require("./tokens");
const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, closeOnOverlay = true, }) => {
    const dialogRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        if (isOpen) {
            dialog.showModal();
        }
        else {
            dialog.close();
        }
    }, [isOpen]);
    (0, react_1.useEffect)(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        const handleClose = () => onClose();
        dialog.addEventListener('close', handleClose);
        return () => dialog.removeEventListener('close', handleClose);
    }, [onClose]);
    if (!isOpen)
        return null;
    const maxWidth = size === 'sm' ? 420 : size === 'lg' ? 720 : 560;
    return (react_1.default.createElement("dialog", { ref: dialogRef, "aria-modal": "true", "aria-label": title || 'Dialog', style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: tokens_1.DESIGN_TOKENS.zIndex.modal,
            padding: tokens_1.DESIGN_TOKENS.spacing[5],
            animation: `sg-fade-in ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
            background: 'transparent',
            border: 'none',
        } },
        react_1.default.createElement("div", { role: "button", tabIndex: 0, onClick: closeOnOverlay ? onClose : undefined, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
            } }, style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: tokens_1.DESIGN_TOKENS.colors.overlay,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: tokens_1.DESIGN_TOKENS.zIndex.modal,
                padding: tokens_1.DESIGN_TOKENS.spacing[5],
                animation: `sg-fade-in ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
            } },
            react_1.default.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
                    background: tokens_1.DESIGN_TOKENS.colors.surface,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.xxl,
                    padding: tokens_1.DESIGN_TOKENS.spacing[7],
                    maxWidth,
                    width: '100%',
                    maxHeight: '85vh',
                    overflow: 'auto',
                    boxShadow: tokens_1.DESIGN_TOKENS.shadows.xl,
                    animation: `sg-slide-up ${tokens_1.DESIGN_TOKENS.motion.standard}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                    position: 'relative',
                } },
                title && (react_1.default.createElement("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: tokens_1.DESIGN_TOKENS.spacing[5],
                    } },
                    react_1.default.createElement("h2", { id: "modal-title", style: {
                            margin: 0,
                            ...tokens_1.DESIGN_TOKENS.typography.headingM,
                            color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                        } }, title),
                    showCloseButton && (react_1.default.createElement("button", { type: "button", onClick: onClose, "aria-label": "Close modal", style: {
                            border: 'none',
                            background: tokens_1.DESIGN_TOKENS.colors.elevated,
                            color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                            cursor: 'pointer',
                            fontSize: 20,
                            width: 36,
                            height: 36,
                            borderRadius: tokens_1.DESIGN_TOKENS.radius.full,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: `background ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                            lineHeight: 1,
                        }, onMouseEnter: (e) => { e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.border; }, onMouseLeave: (e) => { e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.elevated; } }, "\u00D7")))),
                children)),
        react_1.default.createElement("style", null, `
        @keyframes sg-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sg-slide-up { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `)));
};
exports.Modal = Modal;
const BottomSheet = ({ isOpen, onClose, title, children, showCloseButton = true, closeOnOverlay = true, }) => {
    const dialogRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        if (isOpen) {
            dialog.showModal();
        }
        else {
            dialog.close();
        }
    }, [isOpen]);
    (0, react_1.useEffect)(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        const handleClose = () => onClose();
        dialog.addEventListener('close', handleClose);
        return () => dialog.removeEventListener('close', handleClose);
    }, [onClose]);
    if (!isOpen)
        return null;
    return (react_1.default.createElement("dialog", { ref: dialogRef, "aria-modal": "true", "aria-label": title || 'Bottom sheet', style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: tokens_1.DESIGN_TOKENS.zIndex.modal,
            background: 'transparent',
            border: 'none',
        } },
        react_1.default.createElement("div", { role: "button", tabIndex: 0, onClick: closeOnOverlay ? onClose : undefined, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
            } }, style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: tokens_1.DESIGN_TOKENS.colors.overlay,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                zIndex: tokens_1.DESIGN_TOKENS.zIndex.modal,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
            } },
            react_1.default.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
                    background: tokens_1.DESIGN_TOKENS.colors.surface,
                    borderTopLeftRadius: tokens_1.DESIGN_TOKENS.radius.xxl,
                    borderTopRightRadius: tokens_1.DESIGN_TOKENS.radius.xxl,
                    padding: tokens_1.DESIGN_TOKENS.spacing[6],
                    width: '100%',
                    maxWidth: 600,
                    maxHeight: '85vh',
                    overflow: 'auto',
                    boxShadow: tokens_1.DESIGN_TOKENS.shadows.xl,
                    animation: `sg-slide-up ${tokens_1.DESIGN_TOKENS.motion.standard}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                } },
                react_1.default.createElement("div", { style: {
                        width: 40,
                        height: 4,
                        background: tokens_1.DESIGN_TOKENS.colors.border,
                        borderRadius: 2,
                        margin: `0 auto ${tokens_1.DESIGN_TOKENS.spacing[4]}px`,
                    } }),
                title && (react_1.default.createElement("h2", { style: {
                        margin: `0 0 ${tokens_1.DESIGN_TOKENS.spacing[4]}px 0`,
                        ...tokens_1.DESIGN_TOKENS.typography.headingM,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    } }, title)),
                children,
                showCloseButton && (react_1.default.createElement("button", { type: "button", onClick: onClose, "aria-label": "Close sheet", style: {
                        marginTop: tokens_1.DESIGN_TOKENS.spacing[5],
                        width: '100%',
                        padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[4]}px`,
                        border: 'none',
                        borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                        background: tokens_1.DESIGN_TOKENS.colors.elevated,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                        ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                        cursor: 'pointer',
                        transition: `background ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                        minHeight: 44,
                    }, onMouseEnter: (e) => { e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.border; }, onMouseLeave: (e) => { e.currentTarget.style.background = tokens_1.DESIGN_TOKENS.colors.elevated; } }, "Done"))))));
};
exports.BottomSheet = BottomSheet;
