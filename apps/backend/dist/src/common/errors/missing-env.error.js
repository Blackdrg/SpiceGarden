"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingEnvError = void 0;
exports.requireEnv = requireEnv;
exports.requireOneOf = requireOneOf;
class MissingEnvError extends Error {
    constructor(key, hint) {
        super(`Required environment variable "${key}" is missing${hint ? ` — ${hint}` : ''}`);
        this.key = key;
        this.hint = hint;
        this.name = 'MissingEnvError';
    }
}
exports.MissingEnvError = MissingEnvError;
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
        if (value && value.trim() !== '' && !value.includes('CHANGE_ME')) {
            return value;
        }
    }
    throw new MissingEnvError(keys.join(' or '), 'Set at least one of the listed variables to a real, non-placeholder value.');
}
//# sourceMappingURL=missing-env.error.js.map