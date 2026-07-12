import React from 'react';
interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    variant?: 'default' | 'elevated' | 'list' | 'interactive';
    style?: React.CSSProperties;
    isElevated?: boolean;
    onClick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
}
export declare const Card: {
    ({ children, title, subtitle, variant, style, isElevated, onClick, padding, className }: CardProps): React.JSX.Element;
    displayName: string;
};
export {};
//# sourceMappingURL=Card.d.ts.map