"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const react_1 = __importDefault(require("react"));
const Button_module_css_1 = __importDefault(require("./Button.module.css"));
const Button = ({ label, children, onClick, variant = 'primary', size = 'md', isLoading = false, disabled = false, style, ariaLabel, className, }) => {
    const baseClass = `${Button_module_css_1.default.button} ${Button_module_css_1.default[variant]} ${Button_module_css_1.default[size]}`;
    const mergedClassName = className ? `${baseClass} ${className}` : baseClass;
    return (react_1.default.createElement("button", { onClick: onClick, disabled: disabled || isLoading, "aria-label": ariaLabel || label, "aria-disabled": disabled || isLoading, className: mergedClassName, style: style }, isLoading ? 'Loading...' : (label || children)));
};
exports.Button = Button;
