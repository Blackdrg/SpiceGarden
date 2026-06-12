import React from 'react';
interface CardProps {
    children: React.ReactNode;
    title?: string;
    variant?: 'default' | 'elevated' | 'list';
    style?: React.CSSProperties;
    isElevated?: boolean;
}
export declare const Card: ({ children, title, variant, style, isElevated }: CardProps) => React.JSX.Element;
export {};
