import React from 'react';
export declare const DESIGN_TOKENS: {
    colors: {
        primary: string;
        primaryHover: string;
        primaryLight: string;
        primaryDark: string;
        secondary: string;
        secondaryHover: string;
        background: string;
        surface: string;
        elevated: string;
        textPrimary: string;
        textSecondary: string;
        textTertiary: string;
        textInverse: string;
        success: string;
        successLight: string;
        successDark: string;
        danger: string;
        dangerLight: string;
        dangerDark: string;
        warning: string;
        warningLight: string;
        warningDark: string;
        info: string;
        infoLight: string;
        infoDark: string;
        premium: string;
        premiumLight: string;
        border: string;
        borderLight: string;
        borderDark: string;
        divider: string;
        overlay: string;
        overlayLight: string;
        shadow: string;
        shadowMedium: string;
        shadowStrong: string;
        white: string;
        black: string;
        gray50: string;
        gray100: string;
        gray200: string;
        gray300: string;
        gray400: string;
        gray500: string;
        gray600: string;
        gray700: string;
        gray800: string;
        gray900: string;
    };
    icon: {
        primary: string;
        secondary: string;
        muted: string;
        danger: string;
        success: string;
        warning: string;
        info: string;
    };
    spacing: {
        0: number;
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        6: number;
        7: number;
        8: number;
        10: number;
        12: number;
        14: number;
        16: number;
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    typography: {
        fontFamily: string;
        fontFamilyMono: string;
        display: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        headingXL: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
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
        headingXS: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
        };
        bodyL: {
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
        bodySmall: {
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
            letterSpacing: string;
        };
        overline: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            textTransform: string;
        };
    };
    radius: {
        none: number;
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
        full: number;
        button: number;
        input: number;
        card: number;
    };
    motion: {
        instant: number;
        micro: number;
        standard: number;
        moderate: number;
        slow: number;
        page: number;
    };
    shadows: any;
    zIndex: {
        base: number;
        dropdown: number;
        sticky: number;
        overlay: number;
        modal: number;
        toast: number;
        tooltip: number;
    };
};
export declare const MOTION_EASING: {
    easeOutSoft: string;
    easeInOut: string;
    springSmooth: string;
    easeOut: string;
    easeIn: string;
    linear: string;
};
export declare const DARK_MODE_TOKENS: {
    colors: {
        primary: string;
        primaryHover: string;
        primaryLight: string;
        primaryDark: string;
        secondary: string;
        background: string;
        surface: string;
        elevated: string;
        textPrimary: string;
        textSecondary: string;
        textTertiary: string;
        textInverse: string;
        success: string;
        successLight: string;
        successDark: string;
        danger: string;
        dangerLight: string;
        dangerDark: string;
        warning: string;
        warningLight: string;
        warningDark: string;
        info: string;
        infoLight: string;
        infoDark: string;
        premium: string;
        premiumLight: string;
        border: string;
        borderLight: string;
        borderDark: string;
        divider: string;
        overlay: string;
        overlayLight: string;
        shadow: string;
        shadowMedium: string;
        shadowStrong: string;
        white: string;
        black: string;
        gray50: string;
        gray100: string;
        gray200: string;
        gray300: string;
        gray400: string;
        gray500: string;
        gray600: string;
        gray700: string;
        gray800: string;
        gray900: string;
    };
};
export declare const ReducedMotionContext: React.Context<{
    prefersReduced: boolean;
}>;
export declare const useReducedMotion: () => {
    prefersReduced: boolean;
};
export declare const generateCSSVariables: () => Record<string, string>;
export declare const getCSSVariableValue: (varName: string, fallback: string) => string;
//# sourceMappingURL=tokens.d.ts.map