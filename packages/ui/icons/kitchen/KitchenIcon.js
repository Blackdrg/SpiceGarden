"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenIcon = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const tokens_1 = require("../../tokens");
const KitchenIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return ((0, jsx_runtime_1.jsx)(lucide_react_1.ChefHat, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.KitchenIcon = KitchenIcon;
