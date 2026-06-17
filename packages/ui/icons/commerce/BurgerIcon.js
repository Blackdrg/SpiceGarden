"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurgerIcon = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("../../tokens");
const BurgerIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: iconColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, "aria-hidden": props['aria-label'] ? undefined : "true", ...props },
        react_1.default.createElement("path", { d: "M3 11h18" }),
        react_1.default.createElement("path", { d: "M5 11c0-3 2-6 4-6h10c2 0 4 3 4 6" }),
        react_1.default.createElement("path", { d: "M6 15v2c0 1 1 2 2 2h8c1 0 2-1 2-2v-2" }),
        react_1.default.createElement("circle", { cx: "8", cy: "8", r: "1", fill: iconColor }),
        react_1.default.createElement("circle", { cx: "16", cy: "8", r: "1", fill: iconColor })));
};
exports.BurgerIcon = BurgerIcon;
