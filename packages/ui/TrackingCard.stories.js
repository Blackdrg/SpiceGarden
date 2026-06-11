"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delivered = exports.OnTheWay = exports.PickedUp = exports.Preparing = void 0;
const Cards_1 = require("./Cards");
const meta = {
    title: 'Cards/TrackingCard',
    component: Cards_1.TrackingCard,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        status: { control: 'select', options: ['preparing', 'picked-up', 'on-the-way', 'delivered'] },
    },
};
exports.default = meta;
exports.Preparing = {
    args: {
        status: 'preparing',
        eta: 25,
    },
};
exports.PickedUp = {
    args: {
        status: 'picked-up',
        eta: 15,
        address: 'Delivering to MG Road',
    },
};
exports.OnTheWay = {
    args: {
        status: 'on-the-way',
        eta: 8,
        address: 'Near MG Road, Bangalore',
        onContact: () => console.log('Contact driver'),
        onSupport: () => console.log('Support ticket'),
    },
};
exports.Delivered = {
    args: {
        status: 'delivered',
        eta: 0,
        address: 'Delivered to MG Road',
    },
};
