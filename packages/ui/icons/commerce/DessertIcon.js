"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DessertIcon = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("../../tokens");
const DessertIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: iconColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, "aria-hidden": props['aria-label'] ? undefined : "true", ...props },
        react_1.default.createElement("path", { d: "M4 10h16v8c0 2-2 4-4 4h-8c-2 0-4-2-4-4v-8z" }),
        react_1.default.createElement("path", { d: "M8 10V7c0-1 1-2 2-2h4c1 0 2 1 2 2v3" }),
        react_1.default.createElement("path", { d: "M12 6v1" }),
        react_1.default.createElement("circle", { cx: "12", cy: "5", r: "0.5", fill: iconColor })));
};
exports.DessertIcon = DessertIcon;
