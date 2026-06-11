"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
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
            return (0, jsx_runtime_1.jsx)(FallbackComponent, { error: this.state.error, resetError: this.resetError });
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
const DefaultErrorFallback = ({ error, resetError, }) => ((0, jsx_runtime_1.jsx)(Card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: tokens_1.DESIGN_TOKENS.spacing.lg }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Something went wrong" }), (0, jsx_runtime_1.jsx)("p", { style: { color: tokens_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: tokens_1.DESIGN_TOKENS.spacing.md }, children: error.message }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: "Try Again", onClick: resetError, variant: "secondary" })] }) }));
