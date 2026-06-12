"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationIcon = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const tokens_1 = require("../../tokens");
const LocationIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.MapPin, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.LocationIcon = LocationIcon;
