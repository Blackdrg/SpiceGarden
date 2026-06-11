"use strict";
/**
 * Utility functions for order processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortOrdersByDate = exports.groupOrdersByStatus = exports.isTrackable = exports.isReorderable = exports.formatOrderStatus = exports.calculateTotalItems = void 0;
/**
 * Calculate total items in an order
 */
const calculateTotalItems = (items) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
};
exports.calculateTotalItems = calculateTotalItems;
/**
 * Format order status for display
 */
const formatOrderStatus = (status) => {
    if (!status)
        return '';
    return status
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
exports.formatOrderStatus = formatOrderStatus;
/**
 * Check if order is reorderable (delivered)
 */
const isReorderable = (status) => {
    return status === 'delivered';
};
exports.isReorderable = isReorderable;
/**
 * Check if order is trackable (preparing, ready, pickedUp)
 */
const isTrackable = (status) => {
    return ['preparing', 'ready', 'pickedUp'].includes(status);
};
exports.isTrackable = isTrackable;
const groupOrdersByStatus = (orders) => {
    return orders.reduce((acc, order) => {
        const status = order.status || 'unknown';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(order);
        return acc;
    }, {});
};
exports.groupOrdersByStatus = groupOrdersByStatus;
/**
 * Sort orders by date (newest first)
 */
const sortOrdersByDate = (orders) => {
    return [...orders].sort((a, b) => {
        const dateA = new Date(a.createdAt ?? a.date).getTime();
        const dateB = new Date(b.createdAt ?? b.date).getTime();
        return dateB - dateA;
    });
};
exports.sortOrdersByDate = sortOrdersByDate;
