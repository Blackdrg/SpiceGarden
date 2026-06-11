"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileIcon = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const tokens_1 = require("../../tokens");
const ProfileIcon = (props) => {
    const color = props.color || tokens_1.DESIGN_TOKENS.colors.primary;
    const size = props.size || 24;
    const strokeWidth = props.strokeWidth || 2;
    return (0, jsx_runtime_1.jsx)(lucide_react_1.User, { size: size, color: color, strokeWidth: strokeWidth, ...props });
};
exports.ProfileIcon = ProfileIcon;
