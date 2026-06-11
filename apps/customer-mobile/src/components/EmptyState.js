"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = exports.EmptyState = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const ui_1 = require("@spicegarden/ui");
const strings_1 = require("../constants/strings");
const EmptyState = ({ onNavigateHome }) => {
    return (<react_native_1.View style={exports.styles.emptyState}>
      <react_native_1.Text style={exports.styles.emptyIcon}>📋</react_native_1.Text>
      <react_native_1.Text style={exports.styles.emptyText}>{strings_1.STRINGS.orderHistory.empty}</react_native_1.Text>
      <react_native_1.Text style={exports.styles.emptySubtext}>{strings_1.STRINGS.cart.emptySubtext}</react_native_1.Text>
      <react_native_1.TouchableOpacity onPress={onNavigateHome} style={exports.styles.primaryButton} accessibilityLabel={strings_1.STRINGS.cart.browseRestaurants} accessibilityRole="button">
        <react_native_1.Text style={exports.styles.primaryButtonText}>{strings_1.STRINGS.cart.browseRestaurants}</react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
exports.EmptyState = EmptyState;
exports.styles = react_native_1.StyleSheet.create({
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: ui_1.DESIGN_TOKENS.spacing.md,
    },
    emptyText: {
        fontSize: 18,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        marginBottom: 8,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginBottom: 20,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
        marginBottom: 12,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = exports.EmptyState;
