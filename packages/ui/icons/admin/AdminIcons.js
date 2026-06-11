"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShieldIcon = exports.UsersIcon = exports.DashboardIcon = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const tokens_1 = require("../../tokens");
const DashboardIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return ((0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.DashboardIcon = DashboardIcon;
const UsersIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return ((0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.UsersIcon = UsersIcon;
const ShieldIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return ((0, jsx_runtime_1.jsx)(lucide_react_1.ShieldAlert, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.ShieldIcon = ShieldIcon;
