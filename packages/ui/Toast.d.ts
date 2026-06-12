import React from 'react';
type ToastType = 'success' | 'error' | 'info';
interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration: number;
    actionLabel?: string;
    onAction?: () => void;
}
interface ToastContextValue {
    showToast: (toast: Omit<Toast, 'id'>) => void;
    hideToast: (id: string) => void;
}
export declare const useToast: () => ToastContextValue;
export declare const ToastProvider: ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element;
export declare const InlineAlert: ({ type, message, onClose, }: {
    type?: ToastType;
    message: string;
    onClose?: () => void;
}) => React.JSX.Element;
export {};
