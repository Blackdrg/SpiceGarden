"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParse = safeParse;
function safeParse(json) {
    try {
        return JSON.parse(json);
    }
    catch {
        return undefined;
    }
}
