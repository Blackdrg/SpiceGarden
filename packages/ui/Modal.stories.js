"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Large = exports.Small = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Modal_1 = require("./Modal");
const meta = {
    title: 'Overlays/Modal',
    component: Modal_1.Modal,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        size: { control: 'select', options: ['sm', 'md', 'lg'] },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        isOpen: true,
        title: 'Modal Title',
        children: (0, jsx_runtime_1.jsx)("p", { children: "This is a modal dialog with some content." }),
    },
};
exports.Small = {
    args: {
        isOpen: true,
        size: 'sm',
        title: 'Confirmation',
        children: (0, jsx_runtime_1.jsx)("p", { children: "Are you sure you want to continue?" }),
    },
};
exports.Large = {
    args: {
        isOpen: true,
        size: 'lg',
        title: 'Large Modal',
        children: ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: "This is a large modal with more content." }), (0, jsx_runtime_1.jsx)("p", { children: "It can contain forms, tables, or other complex components." })] })),
    },
};
