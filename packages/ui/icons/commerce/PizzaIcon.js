"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PizzaIcon = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("../../tokens");
const PizzaIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: iconColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props },
        react_1.default.createElement("path", { d: "M12 2L2 21h20L12 2z", fill: color ? iconColor + '20' : tokens_1.DESIGN_TOKENS.colors.primary + '20', stroke: iconColor }),
        react_1.default.createElement("circle", { cx: "9", cy: "14", r: "1.5", fill: iconColor }),
        react_1.default.createElement("circle", { cx: "15", cy: "12", r: "1", fill: iconColor }),
        react_1.default.createElement("circle", { cx: "12", cy: "16", r: "1", fill: iconColor })));
};
exports.PizzaIcon = PizzaIcon;
