"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllVariants = exports.Loading = exports.Outline = exports.Destructive = exports.Secondary = exports.Primary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("./Button");
const tokens_1 = require("./tokens");
exports.default = {
    title: 'UI/Button',
    component: Button_1.Button,
    parameters: {
        a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'ghost', 'destructive', 'outline'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        onClick: { action: 'clicked' },
    },
};
exports.Primary = {
    args: {
        label: 'Order Now',
        variant: 'primary',
    },
};
exports.Secondary = {
    args: {
        label: 'Cancel',
        variant: 'secondary',
    },
};
exports.Destructive = {
    args: {
        label: 'Delete Item',
        variant: 'destructive',
    },
};
exports.Outline = {
    args: {
        label: 'View Details',
        variant: 'outline',
    },
};
exports.Loading = {
    args: {
        label: 'Loading...',
        variant: 'primary',
        isLoading: true,
    },
};
const AllVariants = () => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.md, flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { label: "Primary", variant: "primary", onClick: () => { } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: "Secondary", variant: "secondary", onClick: () => { } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: "Ghost", variant: "ghost", onClick: () => { } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: "Destructive", variant: "destructive", onClick: () => { } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: "Outline", variant: "outline", onClick: () => { } })] }));
exports.AllVariants = AllVariants;
