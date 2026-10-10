"use client";
import React, { Component } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { DESIGN_TOKENS } from './tokens';
class ErrorBoundary extends Component {
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
            return React.createElement(FallbackComponent, { error: this.state.error, resetError: this.resetError });
        }
        return this.props.children;
    }
}
const DefaultErrorFallback = ({ error, resetError, }) => (React.createElement(Card, null,
    React.createElement("div", { style: { textAlign: 'center', padding: DESIGN_TOKENS.spacing.lg } },
        React.createElement("h3", null, "Something went wrong"),
        React.createElement("p", { style: { color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing.md } }, error.message),
        React.createElement(Button, { label: "Try Again", onClick: resetError, variant: "secondary" }))));
export { ErrorBoundary };
