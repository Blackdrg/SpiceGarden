"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_FILTER_CONSTANTS = exports.ORDER_STATUS_LABELS = exports.ORDER_STATUSES = exports.ORDER_STATUS = void 0;
exports.ORDER_STATUS = {
    ALL: 'all',
    PREPARING: 'preparing',
    READY: 'ready',
    PICKED_UP: 'pickedUp',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};
exports.ORDER_STATUSES = [
    exports.ORDER_STATUS.ALL,
    exports.ORDER_STATUS.PREPARING,
    exports.ORDER_STATUS.READY,
    exports.ORDER_STATUS.PICKED_UP,
    exports.ORDER_STATUS.DELIVERED,
    exports.ORDER_STATUS.CANCELLED
];
exports.ORDER_STATUS_LABELS = {
    [exports.ORDER_STATUS.ALL]: 'All',
    [exports.ORDER_STATUS.PREPARING]: 'Preparing',
    [exports.ORDER_STATUS.READY]: 'Ready',
    [exports.ORDER_STATUS.PICKED_UP]: 'Picked Up',
    [exports.ORDER_STATUS.DELIVERED]: 'Delivered',
    [exports.ORDER_STATUS.CANCELLED]: 'Cancelled'
};
exports.ORDER_FILTER_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000
};
