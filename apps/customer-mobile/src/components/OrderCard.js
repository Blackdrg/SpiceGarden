"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = exports.OrderCard = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const ui_1 = require("@spicegarden/ui");
const order_constants_1 = require("../constants/order.constants");
const getStatusColor = (status) => {
    switch (status) {
        case 'delivered': return ui_1.DESIGN_TOKENS.colors.success;
        case 'cancelled': return ui_1.DESIGN_TOKENS.colors.danger;
        default: return ui_1.DESIGN_TOKENS.colors.warning;
    }
};
const totalItems = (order) => order.items.reduce((sum, item) => sum + item.quantity, 0);
const formattedTotal = (order) => `₹${order.total.toFixed(2)}`;
const statusLabel = (order) => order_constants_1.ORDER_STATUS_LABELS[order.status] || order.status;
exports.OrderCard = (0, react_1.memo)(function OrderCard({ order, onReorder, onTrack }) {
    return (<react_native_1.View style={exports.styles.orderCard}>
      <react_native_1.View style={exports.styles.orderInfo}>
        <react_native_1.View style={exports.styles.orderHeader}>
          <react_native_1.Text style={exports.styles.orderId}>#{order.id}</react_native_1.Text>
          <react_native_1.View style={[exports.styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <react_native_1.Text style={[exports.styles.orderStatusText, { color: getStatusColor(order.status) }]}>
              {statusLabel}
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>
        <react_native_1.Text style={exports.styles.orderRestaurant}>{order.restaurantName}</react_native_1.Text>
        <react_native_1.View style={exports.styles.orderDetails}>
          <react_native_1.Text style={exports.styles.orderItemsText}>
            {totalItems} items
          </react_native_1.Text>
          <react_native_1.Text style={exports.styles.orderTimeText}>
            {order.date} • {order.time}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={exports.styles.orderTotal}>
          <react_native_1.Text style={exports.styles.orderTotalLabel}>Total:</react_native_1.Text>
          <react_native_1.Text style={exports.styles.orderTotalAmount}>{formattedTotal}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
      <react_native_1.View style={exports.styles.orderActions}>
        {order.status === 'delivered' && onReorder && (<react_native_1.TouchableOpacity onPress={() => onReorder(order.id)} style={exports.styles.reorderButton}>
            <react_native_1.Text style={exports.styles.reorderButtonText}>Reorder</react_native_1.Text>
          </react_native_1.TouchableOpacity>)}
        {['preparing', 'ready', 'pickedUp'].includes(order.status) && onTrack && (<react_native_1.TouchableOpacity onPress={() => onTrack(order.id)} style={exports.styles.trackButton}>
            <react_native_1.Text style={exports.styles.trackButtonText}>Track</react_native_1.Text>
          </react_native_1.TouchableOpacity>)}
      </react_native_1.View>
    </react_native_1.View>);
}, (prev, next) => {
    return prev.order.id === next.order.id &&
        prev.order.status === next.order.status &&
        prev.order.total === next.order.total;
});
exports.styles = react_native_1.StyleSheet.create({
    orderCard: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        marginHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        marginVertical: ui_1.DESIGN_TOKENS.spacing.xs,
        borderRadius: ui_1.DESIGN_TOKENS.radius.card,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    orderInfo: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    orderStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: ui_1.DESIGN_TOKENS.radius.sm,
    },
    orderStatusText: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    orderRestaurant: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    orderItemsText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    orderTimeText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    orderTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderTotalLabel: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    orderTotalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    orderActions: {
        flexDirection: 'row',
    },
    reorderButton: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        paddingVertical: 12,
    },
    reorderButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    trackButton: {
        flex: 1,
        backgroundColor: '#2196f3',
        paddingVertical: 12,
    },
    trackButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = exports.OrderCard;
