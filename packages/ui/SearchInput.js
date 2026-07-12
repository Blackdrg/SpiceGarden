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
exports.SearchInput = void 0;
const react_1 = __importStar(require("react"));
const tokens_1 = require("./tokens");
exports.SearchInput = (0, react_1.forwardRef)(({ placeholder = 'Search...', value, onChange, onSearch, onKeyDown, fullWidth = true, ...props }, ref) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(e.target.value);
        }
        onKeyDown?.(e);
    };
    return (react_1.default.createElement("div", { style: { position: 'relative', width: fullWidth ? '100%' : undefined } },
        react_1.default.createElement("div", { style: {
                position: 'absolute',
                left: tokens_1.DESIGN_TOKENS.spacing[4],
                top: '50%',
                transform: 'translateY(-50%)',
                color: tokens_1.DESIGN_TOKENS.colors.textTertiary,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
            } },
            react_1.default.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
                react_1.default.createElement("circle", { cx: "11", cy: "11", r: "7" }),
                react_1.default.createElement("path", { d: "M21 21l-4.35-4.35" }))),
        react_1.default.createElement("input", { ref: ref, type: "search", placeholder: placeholder, value: value, onChange: onChange, onKeyDown: handleKeyDown, "aria-label": "Search", style: {
                width: fullWidth ? '100%' : undefined,
                padding: `${tokens_1.DESIGN_TOKENS.spacing[3]}px ${tokens_1.DESIGN_TOKENS.spacing[4]}px`,
                paddingLeft: tokens_1.DESIGN_TOKENS.spacing[10],
                paddingRight: tokens_1.DESIGN_TOKENS.spacing[4],
                borderRadius: tokens_1.DESIGN_TOKENS.radius.lg,
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                ...tokens_1.DESIGN_TOKENS.typography.body,
                outline: 'none',
                transition: `border-color ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}, box-shadow ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
                fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                minHeight: 44,
                boxShadow: tokens_1.DESIGN_TOKENS.shadows.xs,
            }, onFocus: (e) => {
                e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens_1.DESIGN_TOKENS.colors.primary}22`;
                e.currentTarget.style.borderColor = tokens_1.DESIGN_TOKENS.colors.primary;
            }, onBlur: (e) => {
                e.currentTarget.style.boxShadow = tokens_1.DESIGN_TOKENS.shadows.xs;
                e.currentTarget.style.borderColor = tokens_1.DESIGN_TOKENS.colors.border;
            }, ...props })));
});
exports.SearchInput.displayName = 'SearchInput';
