import React from 'react';
interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: number;
    variant?: 'text' | 'circular' | 'rectangular';
    style?: React.CSSProperties;
}
export declare const Skeleton: ({ width, height, borderRadius, variant, style, }: SkeletonProps) => React.JSX.Element;
interface SkeletonCardProps {
    count?: number;
}
export declare const SkeletonCard: ({ count }: SkeletonCardProps) => React.JSX.Element;
export declare const SkeletonList: ({ count }: {
    count?: number;
}) => React.JSX.Element;
export {};
