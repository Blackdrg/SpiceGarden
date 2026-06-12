import React from 'react';
interface ButtonProps {
    label?: string;
    children?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'loading' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    ariaLabel?: string;
    className?: string;
}
export declare const Button: ({ label, children, onClick, variant, size, isLoading, disabled, style, ariaLabel, className, }: ButtonProps) => React.JSX.Element;
export {};
