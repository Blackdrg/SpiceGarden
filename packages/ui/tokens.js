"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCSSVariableValue = exports.generateCSSVariables = exports.useReducedMotion = exports.ReducedMotionContext = exports.DARK_MODE_TOKENS = exports.MOTION_EASING = exports.DESIGN_TOKENS = void 0;
const react_1 = __importDefault(require("react"));
exports.DESIGN_TOKENS = {
    colors: {
        primary: '#FF5A1F',
        primaryHover: '#E84E18',
        primaryLight: '#FFF0EB',
        primaryDark: '#CC4400',
        secondary: '#111827',
        secondaryHover: '#1F2937',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        elevated: '#F3F4F6',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        textInverse: '#FFFFFF',
        success: '#10B981',
        successLight: '#D1FAE5',
        successDark: '#059669',
        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        dangerDark: '#DC2626',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        warningDark: '#D97706',
        info: '#3B82F6',
        infoLight: '#DBEAFE',
        infoDark: '#2563EB',
        premium: '#D4AF37',
        premiumLight: '#FDF6E3',
        border: '#E5E7EB',
        borderLight: '#F3F4F6',
        borderDark: '#D1D5DB',
        divider: '#F3F4F6',
        overlay: 'rgba(0, 0, 0, 0.5)',
        overlayLight: 'rgba(0, 0, 0, 0.3)',
        shadow: 'rgba(0, 0, 0, 0.08)',
        shadowMedium: 'rgba(0, 0, 0, 0.12)',
        shadowStrong: 'rgba(0, 0, 0, 0.16)',
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
        gray300: '#D1D5DB',
        gray400: '#9CA3AF',
        gray500: '#6B7280',
        gray600: '#4B5563',
        gray700: '#374151',
        gray800: '#1F2937',
        gray900: '#111827',
    },
    icon: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-text-primary)',
        muted: 'var(--color-text-secondary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
    },
    spacing: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        10: 40,
        12: 48,
        14: 56,
        16: 64,
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },
    typography: {
        fontFamily: 'var(--spicegarden-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
        fontFamilyMono: 'var(--spicegarden-font-mono, "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace)',
        display: { fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
        headingXL: { fontSize: 40, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
        headingL: { fontSize: 32, fontWeight: 700, lineHeight: 1.25 },
        headingM: { fontSize: 24, fontWeight: 600, lineHeight: 1.3 },
        headingS: { fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
        headingXS: { fontSize: 16, fontWeight: 600, lineHeight: 1.5 },
        bodyL: { fontSize: 18, fontWeight: 400, lineHeight: 1.6 },
        body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
        bodyMedium: { fontSize: 16, fontWeight: 500, lineHeight: 1.5 },
        bodySmall: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
        caption: { fontSize: 14, fontWeight: 400, lineHeight: 1.4 },
        captionM: { fontSize: 14, fontWeight: 500, lineHeight: 1.4 },
        smallLabel: { fontSize: 12, fontWeight: 500, lineHeight: 1.3, letterSpacing: '0.01em' },
        overline: { fontSize: 11, fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.08em', textTransform: 'uppercase' },
    },
    radius: {
        none: 0,
        xs: 4,
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        xxl: 24,
        full: 9999,
        button: 12,
        input: 12,
        card: 16,
    },
    motion: {
        instant: 0,
        micro: 150,
        standard: 250,
        moderate: 350,
        slow: 500,
        page: 400,
    },
    shadows: {
        none: 'none',
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        small: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        medium: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        large: '0 8px 24px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.06)',
        xl: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
        premiumFloat: '0 8px 32px rgba(255, 90, 31, 0.20), 0 4px 12px rgba(0, 0, 0, 0.08)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    },
    zIndex: {
        base: 0,
        dropdown: 1000,
        sticky: 1100,
        overlay: 1200,
        modal: 1300,
        toast: 1400,
        tooltip: 1500,
    },
};
exports.MOTION_EASING = {
    easeOutSoft: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    springSmooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    linear: 'linear',
};
exports.DARK_MODE_TOKENS = {
    colors: {
        primary: '#FF7A4D',
        primaryHover: '#FF9A7A',
        primaryLight: 'rgba(255, 90, 31, 0.15)',
        primaryDark: '#CC4400',
        secondary: '#F9FAFB',
        background: '#0F0F0F',
        surface: '#1A1A1A',
        elevated: '#242424',
        textPrimary: '#F9FAFB',
        textSecondary: '#A0A0A0',
        textTertiary: '#707070',
        textInverse: '#111827',
        success: '#34D399',
        successLight: 'rgba(16, 185, 129, 0.15)',
        successDark: '#10B981',
        danger: '#F87171',
        dangerLight: 'rgba(239, 68, 68, 0.15)',
        dangerDark: '#EF4444',
        warning: '#FBBF24',
        warningLight: 'rgba(245, 158, 11, 0.15)',
        warningDark: '#F59E0B',
        info: '#60A5FA',
        infoLight: 'rgba(59, 130, 246, 0.15)',
        infoDark: '#3B82F6',
        premium: '#E8C547',
        premiumLight: 'rgba(212, 175, 55, 0.15)',
        border: '#333333',
        borderLight: '#2A2A2A',
        borderDark: '#404040',
        divider: '#2A2A2A',
        overlay: 'rgba(0, 0, 0, 0.7)',
        overlayLight: 'rgba(0, 0, 0, 0.5)',
        shadow: 'rgba(0, 0, 0, 0.3)',
        shadowMedium: 'rgba(0, 0, 0, 0.4)',
        shadowStrong: 'rgba(0, 0, 0, 0.5)',
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#1A1A1A',
        gray100: '#242424',
        gray200: '#333333',
        gray300: '#404040',
        gray400: '#707070',
        gray500: '#A0A0A0',
        gray600: '#B0B0B0',
        gray700: '#D0D0D0',
        gray800: '#E0E0E0',
        gray900: '#F9FAFB',
    },
};
exports.ReducedMotionContext = react_1.default.createContext({
    prefersReduced: false,
});
const useReducedMotion = () => react_1.default.useContext(exports.ReducedMotionContext);
exports.useReducedMotion = useReducedMotion;
const generateCSSVariables = () => {
    const vars = {};
    const setVar = (key, value) => {
        vars[key] = value;
    };
    setVar('--spicegarden-font-family', exports.DESIGN_TOKENS.typography.fontFamily);
    setVar('--spicegarden-font-mono', exports.DESIGN_TOKENS.typography.fontFamilyMono);
    Object.entries(exports.DESIGN_TOKENS.colors).forEach(([key, value]) => {
        setVar(`--color-${key}`, value);
    });
    Object.entries(exports.DESIGN_TOKENS.spacing).forEach(([key, value]) => {
        setVar(`--spacing-${key}`, `${value}px`);
    });
    Object.entries(exports.DESIGN_TOKENS.radius).forEach(([key, value]) => {
        setVar(`--radius-${key}`, `${value}px`);
    });
    return vars;
};
exports.generateCSSVariables = generateCSSVariables;
const getCSSVariableValue = (varName, fallback) => {
    if (typeof window === 'undefined')
        return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
};
exports.getCSSVariableValue = getCSSVariableValue;
