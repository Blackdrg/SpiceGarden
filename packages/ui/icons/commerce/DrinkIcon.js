"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrinkIcon = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("../../tokens");
const DrinkIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: iconColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props },
        react_1.default.createElement("path", { d: "M6 2h12l-1 8c0 2-1 4-4 4s-4-2-4-4L6 2z" }),
        react_1.default.createElement("path", { d: "M5 10h14" }),
        react_1.default.createElement("path", { d: "M10 15v4" }),
        react_1.default.createElement("path", { d: "M14 15v4" })));
};
exports.DrinkIcon = DrinkIcon;
