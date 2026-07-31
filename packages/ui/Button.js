"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const react_1 = __importDefault(require("react"));
const Button_module_css_1 = __importDefault(require("./Button.module.css"));
const Button = ({ label, children, onClick, variant = 'primary', size = 'md', isLoading = false, disabled = false, style, ariaLabel, className, type = 'button', fullWidth = false, }) => {
    const baseClass = `${Button_module_css_1.default.button} ${Button_module_css_1.default[variant]} ${Button_module_css_1.default[size]}`;
    const mergedClassName = className ? `${baseClass} ${className}` : baseClass;
    return (react_1.default.createElement("button", { type: type, onClick: onClick, disabled: disabled || isLoading, "aria-label": ariaLabel || label, "aria-disabled": disabled || isLoading, className: mergedClassName, style: { width: fullWidth ? '100%' : undefined, ...style } },
        isLoading ? (react_1.default.createElement("span", { className: Button_module_css_1.default.spinner, "aria-hidden": "true" },
            react_1.default.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '1em', height: '1em', animation: 'sg-spin 0.8s linear infinite' } },
                react_1.default.createElement("path", { d: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" })))) : null,
        react_1.default.createElement("span", { className: Button_module_css_1.default.label }, label || children)));
};
exports.Button = Button;
exports.Button.displayName = 'Button';
