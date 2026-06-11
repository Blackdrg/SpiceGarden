"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.WithError = exports.WithSelectedValue = exports.WithLabel = exports.Default = void 0;
const Dropdown_1 = require("./Dropdown");
const meta = {
    title: 'Inputs/Dropdown',
    component: Dropdown_1.Dropdown,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        disabled: { control: 'boolean' },
    },
};
exports.default = meta;
const sampleOptions = [
    { value: 'pizza', label: 'Pizza' },
    { value: 'burger', label: 'Burger' },
    { value: 'pasta', label: 'Pasta' },
    { value: 'salad', label: 'Salad' },
];
exports.Default = {
    args: {
        placeholder: 'Select a category',
        options: sampleOptions,
    },
};
exports.WithLabel = {
    args: {
        label: 'Food Category',
        placeholder: 'Select a category',
        options: sampleOptions,
    },
};
exports.WithSelectedValue = {
    args: {
        label: 'Food Category',
        options: sampleOptions,
        value: 'pizza',
    },
};
exports.WithError = {
    args: {
        label: 'Food Category',
        placeholder: 'Select a category',
        options: sampleOptions,
        error: 'Please select a category',
    },
};
exports.Disabled = {
    args: {
        label: 'Food Category',
        options: sampleOptions,
        disabled: true,
    },
};
