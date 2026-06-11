"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllVariants = exports.WithoutTitle = exports.Elevated = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Card_1 = require("./Card");
const tokens_1 = require("./tokens");
exports.default = {
    title: 'UI/Card',
    component: Card_1.Card,
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'elevated', 'list'],
        },
    },
};
exports.Default = {
    args: {
        title: 'Restaurant Card',
        children: 'This is a default card with some content.',
    },
};
exports.Elevated = {
    args: {
        title: 'Premium Card',
        variant: 'elevated',
        children: 'This is an elevated card with larger shadow.',
    },
};
exports.WithoutTitle = {
    args: {
        children: 'This card has no title, just content.',
    },
};
const AllVariants = () => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.md, flexDirection: 'column' }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Default Card", variant: "default", children: "Standard card variant" }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Elevated Card", variant: "elevated", children: "Elevated card with larger shadow" }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "List Card", variant: "list", children: "List-style card for items" })] }));
exports.AllVariants = AllVariants;
