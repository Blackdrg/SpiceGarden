"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.WithError = exports.SixDigit = exports.FourDigit = void 0;
const OTPInput_1 = require("./OTPInput");
const meta = {
    title: 'Inputs/OTPInput',
    component: OTPInput_1.OTPInput,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        length: { control: 'select', options: [4, 6] },
        disabled: { control: 'boolean' },
    },
};
exports.default = meta;
exports.FourDigit = {
    args: {
        length: 4,
    },
};
exports.SixDigit = {
    args: {
        length: 6,
    },
};
exports.WithError = {
    args: {
        length: 4,
        error: 'Invalid OTP code',
    },
};
exports.Disabled = {
    args: {
        length: 4,
        disabled: true,
    },
};
