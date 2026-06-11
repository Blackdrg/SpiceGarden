"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
const react_1 = __importDefault(require("react"));
react_1.default;
globalThis.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
});
