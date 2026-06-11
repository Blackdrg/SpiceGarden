"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const ui_1 = require("@spicegarden/ui");
const SkeletonRect = ({ width = 100, height = 16, borderRadius = 4, style }) => (<react_native_1.View style={[styles.skeleton, { width, height, borderRadius }, style]}/>);
const styles = react_native_1.StyleSheet.create({
    skeleton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated,
    },
});
exports.default = SkeletonRect;
