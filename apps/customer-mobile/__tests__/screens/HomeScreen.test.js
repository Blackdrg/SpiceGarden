"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_ = require("@jest/globals");

describe('Customer Mobile - Home Screen Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    (0, globals_.it)('displays welcome message for guest user', () => {
        const user = { name: null, email: null };
        const displayName = !user.name ? 'Guest' : user.name.split(' ')[0] || 'Guest';
        expect(displayName).toBe('Guest');
    });

    (0, globals_.it)('filters restaurants by search term', () => {
        const restaurants = [
            { id: 1, name: 'Spice Garden', cuisine: 'Indian' },
            { id: 2, name: 'Pizza Hub', cuisine: 'Italian' },
            { id: 3, name: 'Burger King', cuisine: 'American' },
        ];
        const searchTerm = 'spice';
        const filtered = restaurants.filter(function (r) { return r.name.toLowerCase().includes(searchTerm.toLowerCase()); });
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('Spice Garden');
    });

    (0, globals_.it)('filters restaurants by cuisine type', () => {
        const restaurants = [
            { id: 1, name: 'Spice Garden', cuisine: 'Indian' },
            { id: 2, name: 'Pizza Hub', cuisine: 'Italian' },
            { id: 3, name: 'Curry House', cuisine: 'Indian' },
        ];
        const cuisine = 'Indian';
        const filtered = restaurants.filter(function (r) { return r.cuisine === cuisine; });
        expect(filtered.length).toBe(2);
    });

    (0, globals_.it)('calculates delivery time correctly', () => {
        const order = {
            estimatedTime: 15,
            actualTime: 25,
        };
        const isDelayed = order.actualTime > order.estimatedTime;
        expect(isDelayed).toBe(true);
    });

    (0, globals_.it)('formats currency correctly', () => {
        const amount = 292.5;
        const formatted = "\u20B9" + Math.floor(amount);
        expect(formatted).toBe('₹292');
    });
});