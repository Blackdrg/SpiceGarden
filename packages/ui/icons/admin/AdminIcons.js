"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeMuteIcon = exports.VolumeIcon = exports.FileTextIcon = exports.GiftIcon = exports.CheckCircleIcon = exports.AlertCircleIcon = exports.PackageIcon = exports.ClockIcon = exports.StoreIcon = exports.HeadphonesIcon = exports.ShieldIcon = exports.UsersIcon = exports.DashboardIcon = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const tokens_1 = require("../../tokens");
const DashboardIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.BarChart3, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.DashboardIcon = DashboardIcon;
const UsersIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.Users, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.UsersIcon = UsersIcon;
const ShieldIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.ShieldAlert, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.ShieldIcon = ShieldIcon;
const HeadphonesIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.Headphones, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.HeadphonesIcon = HeadphonesIcon;
const StoreIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.Store, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.StoreIcon = StoreIcon;
const ClockIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.Clock, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.ClockIcon = ClockIcon;
const PackageIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.Package, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.PackageIcon = PackageIcon;
const AlertCircleIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.AlertCircle, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.AlertCircleIcon = AlertCircleIcon;
const CheckCircleIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.CheckCircle, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.CheckCircleIcon = CheckCircleIcon;
const GiftIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.Gift, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.GiftIcon = GiftIcon;
const FileTextIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.FileText, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.FileTextIcon = FileTextIcon;
const VolumeIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.Volume2, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.VolumeIcon = VolumeIcon;
const VolumeMuteIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || tokens_1.DESIGN_TOKENS.colors.primary;
    return (react_1.default.createElement(lucide_react_1.VolumeX, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
exports.VolumeMuteIcon = VolumeMuteIcon;
