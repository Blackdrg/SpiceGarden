"use client";

import React, { Component, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { DESIGN_TOKENS } from './tokens';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.ComponentType<{ error: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DESIGN_TOKENS.spacing[10],
    minHeight: '100vh',
    textAlign: 'center',
  }}>
    <div style={{
      width: 80,
      height: 80,
      borderRadius: DESIGN_TOKENS.radius.full,
      backgroundColor: DESIGN_TOKENS.colors.dangerLight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: DESIGN_TOKENS.spacing[5],
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={DESIGN_TOKENS.colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </div>
    <h3 style={{
      margin: 0,
      marginBottom: DESIGN_TOKENS.spacing[3],
      color: DESIGN_TOKENS.colors.textPrimary,
      ...DESIGN_TOKENS.typography.headingM,
    }}>
      Something went wrong
    </h3>
    <p style={{
      margin: 0,
      color: DESIGN_TOKENS.colors.textSecondary,
      ...DESIGN_TOKENS.typography.bodySmall,
      marginBottom: DESIGN_TOKENS.spacing[5],
      maxWidth: 400,
    }}>
      {error.message}
    </p>
    <Button label="Try Again" onClick={resetError} />
  </div>
);

export { ErrorBoundary };
