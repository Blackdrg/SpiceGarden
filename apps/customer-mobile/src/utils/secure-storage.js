"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeGetItem = safeGetItem;
exports.safeGetJSON = safeGetJSON;
exports.safeSetItem = safeSetItem;
exports.safeSetJSON = safeSetJSON;
exports.safeRemoveItem = safeRemoveItem;
exports.validateCartStructure = validateCartStructure;
exports.getCartSafe = getCartSafe;
exports.saveCartSafe = saveCartSafe;
exports.secureClearStorage = secureClearStorage;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const safe_parse_1 = require("../utils/safe-parse");
const storage_keys_1 = require("../constants/storage.keys");
const validation_1 = require("../utils/validation");
const CRASH_REPORT_KEY = 'spicegarden_crash_report';
async function safeGetItem(key) {
    try {
        return await async_storage_1.default.getItem(key);
    }
    catch (error) {
        securityLog('STORAGE_READ_FAIL', key, error);
        return null;
    }
}
async function safeGetJSON(key, fallback) {
    try {
        const raw = await async_storage_1.default.getItem(key);
        if (!raw)
            return fallback;
        const parsed = (0, safe_parse_1.safeParse)(raw);
        return parsed;
    }
    catch (error) {
        securityLog('STORAGE_PARSE_FAIL', key, error);
        try {
            await async_storage_1.default.removeItem(key);
        }
        catch {
            /* ignore cleanup failure */
        }
        return fallback;
    }
}
async function safeSetItem(key, value) {
    try {
        await async_storage_1.default.setItem(key, value);
    }
    catch (error) {
        securityLog('STORAGE_WRITE_FAIL', key, error);
    }
}
async function safeSetJSON(key, value) {
    try {
        const serialized = JSON.stringify(value);
        await async_storage_1.default.setItem(key, serialized);
    }
    catch (error) {
        securityLog('STORAGE_SERIALIZE_FAIL', key, error);
    }
}
async function safeRemoveItem(key) {
    try {
        await async_storage_1.default.removeItem(key);
    }
    catch (error) {
        securityLog('STORAGE_REMOVE_FAIL', key, error);
    }
}
function validateCartStructure(cart) {
    if (!Array.isArray(cart))
        return false;
    return cart.every((item) => {
        return (typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            !isNaN(item.price) &&
            item.price >= 0 &&
            typeof item.quantity === 'number' &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0);
    });
}
async function getCartSafe() {
    try {
        const cartJson = await async_storage_1.default.getItem(storage_keys_1.STORAGE_KEYS.CART);
        if (!cartJson)
            return [];
        const parsed = (0, safe_parse_1.safeParse)(cartJson);
        if (!validateCartStructure(parsed)) {
            await async_storage_1.default.removeItem(storage_keys_1.STORAGE_KEYS.CART);
            return [];
        }
        return parsed ?? [];
    }
    catch (error) {
        securityLog('CART_LOAD_FAIL', storage_keys_1.STORAGE_KEYS.CART, error);
        try {
            await async_storage_1.default.removeItem(storage_keys_1.STORAGE_KEYS.CART);
        }
        catch {
            /* ignore cleanup failure */
        }
        return [];
    }
}
async function saveCartSafe(cart) {
    if (!validateCartStructure(cart)) {
        securityLog('CART_VALIDATION_FAIL', storage_keys_1.STORAGE_KEYS.CART, 'Invalid cart structure');
        return false;
    }
    try {
        const safeCart = (0, validation_1.validateCart)(cart).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            description: item.description,
        }));
        await async_storage_1.default.setItem(storage_keys_1.STORAGE_KEYS.CART, JSON.stringify(safeCart));
        return true;
    }
    catch (error) {
        securityLog('CART_SAVE_FAIL', storage_keys_1.STORAGE_KEYS.CART, error);
        return false;
    }
}
async function secureClearStorage() {
    const keysToRemove = Object.values(storage_keys_1.STORAGE_KEYS);
    try {
        await async_storage_1.default.multiRemove(keysToRemove);
    }
    catch (error) {
        securityLog('STORAGE_CLEAR_FAIL', 'multi_remove', error);
    }
}
function securityLog(event, key, error) {
    const sanitizedError = error instanceof Error ? error.message : String(error);
    const report = {
        event,
        key,
        error: sanitizedError,
        timestamp: Date.now(),
    };
    try {
        async_storage_1.default.setItem(CRASH_REPORT_KEY, JSON.stringify(report)).catch(() => undefined);
    }
    catch {
        /* storage logging at capacity */
    }
    console.error(`[Security][${event}] key=${key}: ${sanitizedError}`);
}
