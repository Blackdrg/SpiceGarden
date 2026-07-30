"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchIcon = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const tokens_1 = require("../../tokens");
const SearchIcon = (props) => { const color = props.color || tokens_1.DESIGN_TOKENS.colors.primary; const size = props.size || 24; const strokeWidth = props.strokeWidth || 2; return react_1.default.createElement(lucide_react_1.Search, { size: size, color: color, strokeWidth: strokeWidth, ...props }); };
exports.SearchIcon = SearchIcon;
