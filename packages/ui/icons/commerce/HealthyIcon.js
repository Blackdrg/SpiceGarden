"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthyIcon = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("../../tokens");
const HealthyIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: iconColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props },
        react_1.default.createElement("path", { d: "M12 2v2" }),
        react_1.default.createElement("path", { d: "M12 20v2" }),
        react_1.default.createElement("path", { d: "M4.93 4.93l1.41 1.41" }),
        react_1.default.createElement("path", { d: "M17.66 17.66l1.41 1.41" }),
        react_1.default.createElement("path", { d: "M2 12h2" }),
        react_1.default.createElement("path", { d: "M20 12h2" }),
        react_1.default.createElement("path", { d: "M6.34 17.66l-1.41 1.41" }),
        react_1.default.createElement("path", { d: "M19.07 4.93l-1.41 1.41" }),
        react_1.default.createElement("circle", { cx: "12", cy: "12", r: "5" }),
        react_1.default.createElement("path", { d: "M12 8v4l2 2" })));
};
exports.HealthyIcon = HealthyIcon;
