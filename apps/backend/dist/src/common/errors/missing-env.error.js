"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingEnvError = void 0;
exports.isPlaceholderValue = isPlaceholderValue;
exports.getRequiredSecret = getRequiredSecret;
exports.requireSecrets = requireSecrets;
exports.requireEnv = requireEnv;
exports.requireOneOf = requireOneOf;
const PLACEHOLDER_MARKERS = [
    'CHANGE_ME',
    'secret_here',
    'placeholder',
    'sk_test_placeholder',
    'rzp_test_placeholder',
    'whsec_test_placeholder',
    'test_placeholder',
    '<fill',
    '<must replace',
];
class MissingEnvError extends Error {
    key;
    hint;
    constructor(key, hint) {
        super(`Required environment variable "${key}" is missing${hint ? ` — ${hint}` : ''}`);
        this.key = key;
        this.hint = hint;
        this.name = 'MissingEnvError';
    }
}
exports.MissingEnvError = MissingEnvError;
function isPlaceholderValue(value) {
    if (!value || value.trim() === '') {
        return true;
    }
    const normalized = value.trim().toLowerCase();
    return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker.toLowerCase()));
}
function getRequiredSecret(configService, key) {
    const value = configService.get(key);
    if (isPlaceholderValue(value)) {
        throw new MissingEnvError(key, 'Set a real, non-placeholder value before starting the server.');
    }
    return value;
}
function requireSecrets(keys, configService) {
    for (const key of keys) {
        getRequiredSecret(configService, key);
    }
}
function requireEnv(keys, configService) {
    for (const key of keys) {
        const value = configService.get(key);
        if (!value || value.trim() === '') {
            throw new MissingEnvError(key, 'Copy .env.example to .env and fill in all required values before starting the server.');
        }
    }
}
function requireOneOf(keys, configService) {
    for (const key of keys) {
        const value = configService.get(key);
        if (value && value.trim() !== '' && !isPlaceholderValue(value)) {
            return value;
        }
    }
    throw new MissingEnvError(keys.join(' or '), 'Set at least one of the listed variables to a real, non-placeholder value.');
}
