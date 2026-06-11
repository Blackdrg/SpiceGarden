"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const Cards_1 = require("./Cards");
const meta = {
    title: 'Cards/ReviewCard',
    component: Cards_1.ReviewCard,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
};
exports.default = meta;
exports.Default = {
    args: {
        orderId: '#SG-12345',
    },
};
