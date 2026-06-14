"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCartItem = isValidCartItem;
exports.validateCart = validateCart;
exports.isValidOrder = isValidOrder;
exports.isValidOrderItem = isValidOrderItem;
exports.sanitizeOrderItems = sanitizeOrderItems;
exports.isValidOrderId = isValidOrderId;
exports.validateTotals = validateTotals;
exports.clampQuantity = clampQuantity;
exports.clampPrice = clampPrice;
function isValidCartItem(item) {
    if (typeof item !== 'object' || item === null)
        return false;
    const anyItem = item;
    return (typeof anyItem.id === 'string' &&
        typeof anyItem.name === 'string' &&
        typeof anyItem.price === 'number' &&
        !isNaN(anyItem.price) &&
        anyItem.price >= 0 &&
        typeof anyItem.quantity === 'number' &&
        Number.isInteger(anyItem.quantity) &&
        anyItem.quantity > 0 &&
        typeof anyItem.image === 'string' &&
        typeof anyItem.description === 'string');
}
function validateCart(cartData) {
    if (!Array.isArray(cartData)) {
        return [];
    }
    return cartData.filter((item) => isValidCartItem(item));
}
function isValidOrder(order) {
    if (typeof order !== 'object' || order === null)
        return false;
    const anyOrder = order;
    return (typeof anyOrder.id === 'string' &&
        typeof anyOrder.restaurantId === 'string' &&
        typeof anyOrder.restaurantName === 'string' &&
        Array.isArray(anyOrder.items) &&
        anyOrder.items.length > 0 &&
        anyOrder.items.every((item) => isValidOrderItem(item)) &&
        typeof anyOrder.total === 'number' &&
        !isNaN(anyOrder.total) &&
        anyOrder.total >= 0);
}
function isValidOrderItem(item) {
    if (typeof item !== 'object' || item === null)
        return false;
    const anyItem = item;
    return (typeof anyItem.id === 'string' &&
        typeof anyItem.name === 'string' &&
        typeof anyItem.quantity === 'number' &&
        Number.isInteger(anyItem.quantity) &&
        anyItem.quantity > 0 &&
        typeof anyItem.price === 'number' &&
        !isNaN(anyItem.price) &&
        anyItem.price >= 0);
}
function sanitizeOrderItems(items) {
    return items.reduce((acc, item) => {
        const cleaned = { ...item, quantity: Math.max(1, item.quantity), price: Math.max(0, item.price) };
        if (cleaned.quantity > 0 && cleaned.price >= 0) acc.push(cleaned);
        return acc;
    }, []);
}
function isValidOrderId(orderId) {
    return typeof orderId === 'string' && orderId.length > 0 && /^[a-zA-Z0-9-]+$/.test(orderId);
}
function validateTotals(items, taxRate = 0.05) {
    const validItems = items.filter(isValidCartItem);
    if (validItems.length === 0) {
        return null;
    }
    const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal <= 0) {
        return null;
    }
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    if (total <= 0 || isNaN(total) || !isFinite(total)) {
        return null;
    }
    return { subtotal, tax, total: Math.round(total * 100) / 100 };
}
function clampQuantity(quantity, max = 99) {
    if (!Number.isFinite(quantity))
        return 1;
    return Math.max(1, Math.min(quantity, max));
}
function clampPrice(price) {
    if (!Number.isFinite(price))
        return 0;
    return Math.max(0, Math.round(price * 100) / 100);
}
