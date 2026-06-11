"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = exports.OrderTabs = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const ui_1 = require("@spicegarden/ui");
const order_constants_1 = require("../constants/order.constants");
const OrderTabs = ({ filter, onFilterChange }) => {
    return (<react_native_1.View style={exports.styles.tabsContainer}>
      <react_native_1.View style={exports.styles.tabs}>
        {Object.keys(order_constants_1.ORDER_STATUS).map((key) => {
            const statusKey = key;
            const statusValue = order_constants_1.ORDER_STATUS[statusKey];
            return (<react_native_1.TouchableOpacity key={statusValue} onPress={() => onFilterChange(statusValue)} style={[exports.styles.tabButton, filter === statusValue && exports.styles.activeTab]} accessibilityLabel={`${order_constants_1.ORDER_STATUS_LABELS[statusValue]} orders`} accessibilityRole="tab">
              <react_native_1.Text style={[exports.styles.tabText, filter === statusValue && exports.styles.activeTabText]}>
                {order_constants_1.ORDER_STATUS_LABELS[statusValue]}
              </react_native_1.Text>
            </react_native_1.TouchableOpacity>);
        })}
      </react_native_1.View>
    </react_native_1.View>);
};
exports.OrderTabs = OrderTabs;
exports.styles = react_native_1.StyleSheet.create({
    tabsContainer: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        paddingVertical: ui_1.DESIGN_TOKENS.spacing.xs,
    },
    tabButton: {
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        paddingVertical: 8,
        marginRight: 12,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: ui_1.DESIGN_TOKENS.colors.primary,
    },
    activeTabText: {
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontWeight: '600',
    },
    tabText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = exports.OrderTabs;
