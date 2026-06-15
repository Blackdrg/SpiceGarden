"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("@testing-library/react-native");
const App_1 = __importDefault(require("../App"));
describe('App', () => {
    it('renders the auth screen', () => {
        const { getByText } = (0, react_native_1.render)(<App_1.default />);
        expect(getByText(/SpiceGarden/i)).toBeTruthy();
    });
});
