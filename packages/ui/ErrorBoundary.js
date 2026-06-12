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
exports.ErrorBoundary = void 0;
const react_1 = __importStar(require("react"));
const Button_1 = require("./Button");
const Card_1 = require("./Card");
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
const DefaultErrorFallback = ({ error, resetError, }) => (react_1.default.createElement(Card_1.Card, null,
    react_1.default.createElement("div", { style: { textAlign: 'center', padding: tokens_1.DESIGN_TOKENS.spacing.lg } },
        react_1.default.createElement("h3", null, "Something went wrong"),
        react_1.default.createElement("p", { style: { color: tokens_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: tokens_1.DESIGN_TOKENS.spacing.md } }, error.message),
        react_1.default.createElement(Button_1.Button, { label: "Try Again", onClick: resetError, variant: "secondary" }))));
