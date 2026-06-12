import React from 'react';
export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    style?: React.CSSProperties;
}
export declare const EmptyState: ({ title, description, icon, actionLabel, onAction, style }: EmptyStateProps) => React.JSX.Element;
export interface NetworkErrorProps {
    onRetry?: () => void;
    message?: string;
}
export declare const NetworkError: ({ onRetry, message }: NetworkErrorProps) => React.JSX.Element;
export interface LoadingStateProps {
    count?: number;
    variant?: 'card' | 'list' | 'text';
}
export declare const LoadingState: ({ count, variant }: LoadingStateProps) => React.JSX.Element;
