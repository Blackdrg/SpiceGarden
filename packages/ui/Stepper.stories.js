"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.AtMax = exports.WithLabel = exports.Default = void 0;
const Stepper_1 = require("./Stepper");
const meta = {
    title: 'Inputs/Stepper',
    component: Stepper_1.Stepper,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        value: { control: 'number' },
        min: { control: 'number' },
        max: { control: 'number' },
        disabled: { control: 'boolean' },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        value: 1,
        onChange: () => { },
    },
};
exports.WithLabel = {
    args: {
        label: 'Quantity',
        value: 2,
        onChange: () => { },
    },
};
exports.AtMax = {
    args: {
        label: 'Quantity',
        value: 10,
        min: 1,
        max: 10,
        onChange: () => { },
    },
};
exports.Disabled = {
    args: {
        label: 'Quantity',
        value: 1,
        disabled: true,
    },
};
