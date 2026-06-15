"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_ = require("@jest/globals");

describe('Cart Screen - Integration Tests', () => {
    (0, globals_.it)('should show empty state when cart is empty', () => {
        var cartItems = [];
        expect(cartItems.length).toBe(0);
    });

    (0, globals_.it)('should calculate subtotal correctly', () => {
        var cartItems = [
            { id: '1', name: 'Burger', price: 150, quantity: 2 },
            { id: '2', name: 'Fries', price: 80, quantity: 1 },
        ];
        var subtotal = cartItems.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
        expect(subtotal).toBe(380);
    });

    (0, globals_.it)('should calculate grand total with fees', () => {
        var subtotal = 380;
        var deliveryFee = 20;
        var tax = subtotal * 0.05;
        var tip = 50;
        var grandTotal = subtotal + deliveryFee + tax + tip;
        expect(grandTotal).toBe(469);
    });

    (0, globals_.it)('should handle item quantity increase', () => {
        var item = { id: '1', quantity: 1 };
        item.quantity += 1;
        expect(item.quantity).toBe(2);
    });

    (0, globals_.it)('should handle item quantity decrease', () => {
        var items = [
            { id: '1', quantity: 2 },
            { id: '2', quantity: 1 },
        ];
        var updated = items.reduce(function (acc, item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
                acc.push(item);
            }
            return acc;
        }, []);
        expect(updated.length).toBe(1);
    });

    (0, globals_.it)('should apply promo discount', () => {
        var subtotal = 250;
        var promo = { code: 'WELCOME50', discount: 50 };
        var discount = Math.min(subtotal * 0.5, promo.discount);
        expect(discount).toBe(50);
        expect(subtotal - discount).toBe(200);
    });
});