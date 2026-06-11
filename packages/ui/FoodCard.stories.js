"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonVegSpicy = exports.VegDish = exports.WithOfferBadge = exports.WithImage = exports.Default = void 0;
const Cards_1 = require("./Cards");
const meta = {
    title: 'Cards/FoodCard',
    component: Cards_1.FoodCard,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        isVeg: { control: 'boolean' },
        spiceLevel: { control: 'select', options: [1, 2, 3] },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        title: 'Margherita Pizza',
        price: 299,
        rating: 4.5,
    },
};
exports.WithImage = {
    args: {
        title: 'Chicken Burger',
        price: 199,
        rating: 4.2,
        image: 'https://placehold.co/80x80?text=Burger',
    },
};
exports.WithOfferBadge = {
    args: {
        title: 'Cheese Pizza',
        price: 349,
        rating: 4.7,
        offerBadge: '20% OFF',
        image: 'https://placehold.co/80x80?text=Pizza',
    },
};
exports.VegDish = {
    args: {
        title: 'Paneer Tikka',
        price: 249,
        rating: 4.3,
        isVeg: true,
        spiceLevel: 2,
        image: 'https://placehold.co/80x80?text=Paneer',
    },
};
exports.NonVegSpicy = {
    args: {
        title: 'Spicy Chicken Wings',
        price: 279,
        rating: 4.6,
        isVeg: false,
        spiceLevel: 3,
        image: 'https://placehold.co/80x80?text=Wings',
    },
};
