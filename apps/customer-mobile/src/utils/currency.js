"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatNumber = formatNumber;
exports.formatDate = formatDate;
exports.formatTime = formatTime;
const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
};
function formatCurrency(amount, currency = 'INR') {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
}
function formatNumber(value, locale = undefined) {
    return new Intl.NumberFormat(locale).format(value);
}
function formatDate(date, locale = undefined) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
function formatTime(time, locale = undefined) {
    if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
        return time;
    }
    const dateObj = typeof time === 'string' ? new Date(time) : time;
    return dateObj.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
}
