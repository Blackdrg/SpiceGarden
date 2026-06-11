"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMotion = void 0;
const react_1 = require("react");
const useMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Check if user has reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e) => {
            setPrefersReducedMotion(e.matches);
        };
        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches);
        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);
        // Cleanup
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return prefersReducedMotion;
};
exports.useMotion = useMotion;
