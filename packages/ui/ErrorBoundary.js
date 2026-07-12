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
exports.ErrorBoundary = void 0;
const react_1 = __importStar(require("react"));
const Button_1 = require("./Button");
const tokens_1 = require("./tokens");
class ErrorBoundary extends react_1.Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null,
        };
        this.resetError = () => {
            this.setState({ hasError: false, error: null });
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError && this.state.error) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return react_1.default.createElement(FallbackComponent, { error: this.state.error, resetError: this.resetError });
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
const DefaultErrorFallback = ({ error, resetError, }) => (react_1.default.createElement("div", { style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens_1.DESIGN_TOKENS.spacing[10],
        minHeight: '100vh',
        textAlign: 'center',
    } },
    react_1.default.createElement("div", { style: {
            width: 80,
            height: 80,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.full,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.dangerLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens_1.DESIGN_TOKENS.spacing[5],
        } },
        react_1.default.createElement("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: tokens_1.DESIGN_TOKENS.colors.danger, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
            react_1.default.createElement("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
            react_1.default.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
            react_1.default.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }))),
    react_1.default.createElement("h3", { style: {
            margin: 0,
            marginBottom: tokens_1.DESIGN_TOKENS.spacing[3],
            color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
            ...tokens_1.DESIGN_TOKENS.typography.headingM,
        } }, "Something went wrong"),
    react_1.default.createElement("p", { style: {
            margin: 0,
            color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
            ...tokens_1.DESIGN_TOKENS.typography.bodySmall,
            marginBottom: tokens_1.DESIGN_TOKENS.spacing[5],
            maxWidth: 400,
        } }, error.message),
    react_1.default.createElement(Button_1.Button, { label: "Try Again", onClick: resetError })));
