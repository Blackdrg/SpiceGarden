"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.WithValue = exports.Default = void 0;
const SearchInput_1 = require("./SearchInput");
const meta = {
    title: 'Inputs/SearchInput',
    component: SearchInput_1.SearchInput,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        placeholder: { control: 'text' },
        disabled: { control: 'boolean' },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        placeholder: 'Search restaurants...',
    },
};
exports.WithValue = {
    args: {
        placeholder: 'Search...',
        value: 'Pizza',
    },
};
exports.Disabled = {
    args: {
        placeholder: 'Search...',
        disabled: true,
    },
};
