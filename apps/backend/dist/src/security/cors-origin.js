"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedOrigins = getAllowedOrigins;
exports.isAllowedOrigin = isAllowedOrigin;
const DEFAULT_ALLOWED_ORIGINS = 'http://localhost:3002,http://localhost:3003,http://localhost:3004';
function getAllowedOrigins() {
    return (process.env.CORS_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }
    return getAllowedOrigins().includes(origin);
}
