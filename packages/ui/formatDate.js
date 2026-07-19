"use strict";
// SSR-safe date formatting.
//
// `Date.prototype.toLocaleString()` / `toLocaleDateString()` format using the
// server's locale and timezone during SSR but the browser's locale/timezone on
// the client. That produces different text on the server vs the client and
// triggers a React hydration mismatch.
//
// These helpers always pass an explicit `locale` and `timeZone` so the server
// and the browser render identical output. Defaults match the platform's
// primary market (India / IST).
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TIME_ZONE = exports.DEFAULT_LOCALE = void 0;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.formatTime = formatTime;
exports.formatNumber = formatNumber;
exports.DEFAULT_LOCALE = 'en-IN';
exports.DEFAULT_TIME_ZONE = 'Asia/Kolkata';
function formatDate(value, options) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime()))
        return '';
    return date.toLocaleDateString(options?.locale ?? exports.DEFAULT_LOCALE, {
        timeZone: options?.timeZone ?? exports.DEFAULT_TIME_ZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
function formatDateTime(value, options) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime()))
        return '';
    return date.toLocaleString(options?.locale ?? exports.DEFAULT_LOCALE, {
        timeZone: options?.timeZone ?? exports.DEFAULT_TIME_ZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
function formatTime(value, options) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime()))
        return '';
    return date.toLocaleTimeString(options?.locale ?? exports.DEFAULT_LOCALE, {
        timeZone: options?.timeZone ?? exports.DEFAULT_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
    });
}
// SSR-safe number formatting. Grouping separators differ by locale (e.g.
// "1,234" vs "1.234"), which also causes hydration mismatches if the server
// and browser resolve different default locales.
function formatNumber(value, options) {
    if (typeof value !== 'number' || Number.isNaN(value))
        return '';
    return value.toLocaleString(options?.locale ?? exports.DEFAULT_LOCALE, {
        maximumFractionDigits: options?.maximumFractionDigits,
        minimumFractionDigits: options?.minimumFractionDigits,
    });
}
