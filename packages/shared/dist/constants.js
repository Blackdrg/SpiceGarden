"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_URL = exports.API_URL = void 0;
exports.API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
exports.SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || 'http://localhost:3001';
