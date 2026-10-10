"use client";
import React from 'react';
import { DESIGN_TOKENS } from './tokens';
const LottieSuccessAnimation = ({ width = 200, height = 200, speed = 1, loop = false, style }) => {
    return (React.createElement("div", { style: {
            width: width,
            height: height,
            ...style
        } },
        React.createElement("svg", { viewBox: "0 0 100 100", style: { width: '100%', height: '100%' } },
            React.createElement("circle", { cx: "50", cy: "50", r: "40", fill: DESIGN_TOKENS.colors.success, opacity: "0.2" }),
            React.createElement("path", { d: "M 30 50 L 45 65 L 70 35", stroke: DESIGN_TOKENS.colors.success, strokeWidth: "8", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }))));
};
export default LottieSuccessAnimation;
