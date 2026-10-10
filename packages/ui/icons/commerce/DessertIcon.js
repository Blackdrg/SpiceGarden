import React from 'react';
import { DESIGN_TOKENS } from '../../tokens';
export const DessertIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || DESIGN_TOKENS.colors.primary;
    return (React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: iconColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, "aria-hidden": props['aria-label'] ? undefined : "true", ...props },
        React.createElement("path", { d: "M4 10h16v8c0 2-2 4-4 4h-8c-2 0-4-2-4-4v-8z" }),
        React.createElement("path", { d: "M8 10V7c0-1 1-2 2-2h4c1 0 2 1 2 2v3" }),
        React.createElement("path", { d: "M12 6v1" }),
        React.createElement("circle", { cx: "12", cy: "5", r: "0.5", fill: iconColor })));
};
