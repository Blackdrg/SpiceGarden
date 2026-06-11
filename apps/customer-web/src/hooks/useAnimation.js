"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHoverAnimation = exports.useEnterAnimation = void 0;
const react_1 = require("react");
/**
 * Hook to handle enter animations (fade in, slide up, etc.)
 * @param {boolean} show - Whether the element should be visible
 * @param {string} type - Type of animation ('fade', 'slide-up', 'slide-down', 'zoom')
 * @param {number} duration - Animation duration in milliseconds
 * @returns {Object} Animated style object
 */
const useEnterAnimation = (show, type = 'fade', duration = 300) => {
    const [animate, setAnimate] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (show) {
            // Trigger animation after a slight delay to ensure element is mounted
            const timer = setTimeout(() => setAnimate(true), 50);
            return () => clearTimeout(timer);
        }
        else {
            setAnimate(false);
        }
    }, [show]);
    const baseStyle = {
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        opacity: animate ? 1 : 0,
    };
    switch (type) {
        case 'slide-up':
            return {
                ...baseStyle,
                transform: animate ? 'translateY(0)' : 'translateY(20px)',
            };
        case 'slide-down':
            return {
                ...baseStyle,
                transform: animate ? 'translateY(0)' : 'translateY(-20px)',
            };
        case 'zoom':
            return {
                ...baseStyle,
                transform: animate ? 'scale(1)' : 'scale(0.95)',
            };
        case 'fade':
        default:
            return baseStyle;
    }
};
exports.useEnterAnimation = useEnterAnimation;
/**
 * Hook to handle hover animations with reduced motion support
 * @param {boolean} prefersReducedMotion - Whether user prefers reduced motion
 * @returns {Object} Hover style object
 */
const useHoverAnimation = (prefersReducedMotion) => {
    if (prefersReducedMotion) {
        return {};
    }
    return {
        ':hover:not(:active):not([disabled])': {
            opacity: 0.9,
            transform: 'translateY(-2px)',
        },
        ':active:not([disabled])': {
            transform: 'translateY(0)',
        },
    };
};
exports.useHoverAnimation = useHoverAnimation;
