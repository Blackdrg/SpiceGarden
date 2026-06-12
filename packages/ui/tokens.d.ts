import React from 'react';
export declare const DESIGN_TOKENS: {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        elevated: string;
        textPrimary: string;
        textSecondary: string;
        textInverse: string;
        success: string;
        danger: string;
        warning: string;
        premium: string;
        border: string;
        dangerDark: string;
        neutral: string;
    };
    icon: {
        primary: string;
        secondary: string;
        muted: string;
        danger: string;
        success: string;
        warning: string;
    };
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    typography: {
        fontFamily: string;
        headingXL: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        headingL: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        headingM: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        headingS: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        body: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        bodyMedium: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        caption: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        captionM: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        smallLabel: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
    };
    radius: {
        sm: number;
        md: number;
        button: number;
        input: number;
        card: number;
        container: number;
        full: number;
    };
    motion: {
        micro: number;
        standard: number;
        page: number;
    };
    shadows: {
        small: string;
        medium: string;
        large: string;
        premiumFloat: string;
    };
};
export declare const MOTION_EASING: {
    easeOutSoft: string;
    easeInOut: string;
    springSmooth: string;
};
export declare const DARK_MODE_TOKENS: {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        elevated: string;
        textPrimary: string;
        textSecondary: string;
        textInverse: string;
        border: string;
    };
};
export declare const ReducedMotionContext: React.Context<{
    prefersReduced: boolean;
}>;
export declare const useReducedMotion: () => {
    prefersReduced: boolean;
};
