"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = exports.LoadingState = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const ui_1 = require("@spicegarden/ui");
const LoadingState = ({ showText = true }) => {
    return (<react_native_1.View style={exports.styles.loadingContainer}>
      <react_native_1.ActivityIndicator size="large" color={ui_1.DESIGN_TOKENS.colors.primary}/>
      {showText && (<react_native_1.Text style={exports.styles.loadingText}>
          Loading your order history...
        </react_native_1.Text>)}
    </react_native_1.View>);
};
exports.LoadingState = LoadingState;
exports.styles = react_native_1.StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
    },
    loadingText: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 16,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = exports.LoadingState;
