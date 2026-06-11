"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearDelivery = exports.NearPickup = exports.Default = void 0;
const Cards_1 = require("./Cards");
const meta = {
    title: 'Cards/MapCard',
    component: Cards_1.MapCard,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        eta: { control: 'number' },
        progress: { control: 'range', min: 0, max: 100 },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        eta: 15,
        riderName: 'Rohan',
        progress: 50,
    },
};
exports.NearPickup = {
    args: {
        eta: 5,
        riderName: 'Amit',
        progress: 30,
    },
};
exports.NearDelivery = {
    args: {
        eta: 3,
        riderName: 'Priya',
        progress: 90,
    },
};
