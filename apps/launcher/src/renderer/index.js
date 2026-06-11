"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_ = __importDefault(require("react"));
const client_ = require("react-dom/client");
const Dashboard_ = require("./pages/Dashboard");
require("./styles.css");
const rootElement = document.getElementById('root');
if (rootElement) {
    (, client_.createRoot)(rootElement).render(<Dashboard_.Dashboard />);
}
