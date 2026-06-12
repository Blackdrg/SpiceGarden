"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const LottieSuccessAnimation = ({ width = 200, height = 200, speed = 1, loop = false, style }) => {
    return (react_1.default.createElement("div", { style: {
            width: width,
            height: height,
            ...style
        } },
        react_1.default.createElement("svg", { viewBox: "0 0 100 100", style: { width: '100%', height: '100%' } },
            react_1.default.createElement("circle", { cx: "50", cy: "50", r: "40", fill: tokens_1.DESIGN_TOKENS.colors.success, opacity: "0.2" }),
            react_1.default.createElement("path", { d: "M 30 50 L 45 65 L 70 35", stroke: tokens_1.DESIGN_TOKENS.colors.success, strokeWidth: "8", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }))));
};
exports.default = LottieSuccessAnimation;
