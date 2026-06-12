"use strict";
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
    return (react_1.default.createElement("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, style: {
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
        }, onClick: onClose },
        react_1.default.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
                background: tokens_1.DESIGN_TOKENS.colors.surface,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
                padding: tokens_1.DESIGN_TOKENS.spacing.lg,
                maxWidth,
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.large,
                animation: `slideUp ${tokens_1.DESIGN_TOKENS.motion.page}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
            } },
            title && (react_1.default.createElement("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg,
                } },
                react_1.default.createElement("h2", { id: "modal-title", style: {
                        margin: 0,
                        ...tokens_1.DESIGN_TOKENS.typography.headingM,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    } }, title),
                showCloseButton && (react_1.default.createElement("button", { onClick: onClose, "aria-label": "Close modal", style: {
                        border: 'none',
                        background: 'transparent',
                        color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                        cursor: 'pointer',
                        fontSize: 24,
                    } }, "\u00D7")))),
            children),
        react_1.default.createElement("style", null, `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `)));
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
    return (react_1.default.createElement("div", { role: "dialog", "aria-modal": "true", style: {
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
        }, onClick: onClose },
        react_1.default.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
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
            } },
            react_1.default.createElement("div", { style: {
                    width: 40,
                    height: 4,
                    background: tokens_1.DESIGN_TOKENS.colors.border,
                    borderRadius: 2,
                    margin: '0 auto 16px',
                } }),
            title && (react_1.default.createElement("h2", { style: {
                    margin: '0 0 16px 0',
                    ...tokens_1.DESIGN_TOKENS.typography.headingM,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                } }, title)),
            children,
            showCloseButton && (react_1.default.createElement("button", { onClick: onClose, "aria-label": "Close sheet", style: {
                    marginTop: tokens_1.DESIGN_TOKENS.spacing.lg,
                    width: '100%',
                    padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                    border: 'none',
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                    background: tokens_1.DESIGN_TOKENS.colors.primary,
                    color: 'white',
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    cursor: 'pointer',
                } }, "Done")))));
};
exports.BottomSheet = BottomSheet;
