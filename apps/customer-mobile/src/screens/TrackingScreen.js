"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingScreen = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const ui_1 = require("@spicegarden/ui");
const TrackingScreen = () => {
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>Tracking screen placeholder</react_native_1.Text>
    </react_native_1.View>);
};
exports.TrackingScreen = TrackingScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
        padding: 20,
    },
    title: {
        fontSize: 18,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = exports.TrackingScreen;
