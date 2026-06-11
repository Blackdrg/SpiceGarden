"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboMeal = exports.SectionCard = exports.ItemDefault = void 0;
const Cards_1 = require("./Cards");
const meta = {
    title: 'Cards/MenuCard',
    component: Cards_1.MenuCard,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        variant: { control: 'select', options: ['section', 'item', 'combo'] },
    },
};
exports.default = meta;
exports.ItemDefault = {
    args: {
        variant: 'item',
        title: 'Margherita Pizza',
        description: 'Classic cheese pizza with tomato sauce',
        price: 299,
    },
};
exports.SectionCard = {
    args: {
        variant: 'section',
        title: 'Starters',
        description: 'Begin your meal with our delicious starters',
    },
};
exports.ComboMeal = {
    args: {
        variant: 'combo',
        title: 'Family Combo',
        description: '2 Large Pizzas + 4 Drinks + Garlic Bread',
        price: 899,
    },
};
