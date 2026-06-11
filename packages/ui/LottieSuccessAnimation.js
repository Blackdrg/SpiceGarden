"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const tokens_1 = require("./tokens");
const LottieSuccessAnimation = ({ width = 200, height = 200, speed = 1, loop = false, style }) => {
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: width,
            height: height,
            ...style
        }, children: (0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 100 100", style: { width: '100%', height: '100%' }, children: [(0, jsx_runtime_1.jsx)("circle", { cx: "50", cy: "50", r: "40", fill: tokens_1.DESIGN_TOKENS.colors.success, opacity: "0.2" }), (0, jsx_runtime_1.jsx)("path", { d: "M 30 50 L 45 65 L 70 35", stroke: tokens_1.DESIGN_TOKENS.colors.success, strokeWidth: "8", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" })] }) }));
};
exports.default = LottieSuccessAnimation;
