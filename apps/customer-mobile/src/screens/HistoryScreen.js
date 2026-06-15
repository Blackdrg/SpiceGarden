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
/* eslint-disable */
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const native_1 = require("@react-navigation/native");
const Haptics = __importStar(require("expo-haptics"));
const ui_1 = require("@spicegarden/ui");
const strings_1 = require("../constants/strings");
const useOrderHistory_1 = require("../hooks/useOrderHistory");
const OrderCard_1 = require("../components/OrderCard");
const OrderTabs_1 = require("../components/OrderTabs");
const EmptyState_1 = require("../components/EmptyState");
const LoadingState_1 = require("../components/LoadingState");
const validation_1 = require("../utils/validation");
const HistoryScreen = () => {
    const navigation = (0, native_1.useNavigation)();
    const { orders, filteredOrders, filter, loading, refreshing, loadingMore, error, onRefresh, loadMore, handleRetry, handleFilterChange } = (0, useOrderHistory_1.useOrderHistory)();
    const handleReorder = (0, react_1.useCallback)(async (orderId) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (!(0, validation_1.isValidOrderId)(orderId)) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                return;
            }
            const { orderService } = await Promise.resolve().then(() => __importStar(require('../services/order.service')));
            const existingCart = await orderService.getCart();
            const updatedCart = await orderService.reorderItems(orderId, existingCart);
            await orderService.saveCart(updatedCart);
            navigation.navigate('Cart');
        }
        catch (err) {
            console.error('Reorder failed:', err);
        }
    }, [navigation]);
    const handleTrack = (0, react_1.useCallback)((orderId) => {
        Haptics.selectionAsync();
        if (!(0, validation_1.isValidOrderId)(orderId))
            return;
        navigation.navigate('Tracking', { orderId });
    }, [navigation]);
    const handleCardPress = (0, react_1.useCallback)((orderId) => {
        Haptics.selectionAsync();
        if (!(0, validation_1.isValidOrderId)(orderId))
            return;
        navigation.navigate('OrderDetails', { orderId });
    }, [navigation]);
    if (loading) {
        return <LoadingState_1.LoadingState showText={true}/>;
    }
    if (error && orders.length === 0) {
        return (<react_native_1.View style={styles.errorContainer}>
        <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
        <react_native_1.TouchableOpacity onPress={handleRetry} style={styles.primaryButton} accessibilityLabel={strings_1.STRINGS.orderHistory.retry} accessibilityRole="button">
          <react_native_1.Text style={styles.primaryButtonText}>{strings_1.STRINGS.orderHistory.retry}</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.TouchableOpacity onPress={() => navigation.navigate('Home')} style={[styles.primaryButton, styles.secondaryButton]} accessibilityLabel={strings_1.STRINGS.orderHistory.backToHome} accessibilityRole="button">
          <react_native_1.Text style={[styles.primaryButtonText, styles.secondaryButtonText]}>
            {strings_1.STRINGS.orderHistory.backToHome}
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>);
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={strings_1.STRINGS.accessibility.backButton} accessibilityRole="button">
          <react_native_1.Text style={styles.backButtonText}>Back</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.Text style={styles.headerText}>{strings_1.STRINGS.orderHistory.title}</react_native_1.Text>
      </react_native_1.View>

      <OrderTabs_1.OrderTabs filter={filter} onFilterChange={handleFilterChange}/>

      <react_native_1.View style={styles.ordersContainer}>
        {filteredOrders.length === 0 ? (<EmptyState_1.EmptyState onNavigateHome={() => navigation.navigate('Home')}/>) : (<>
            {filteredOrders.map((order) => (<OrderCard_1.OrderCard key={order.id} order={order} onReorder={order.status === 'delivered' ? handleReorder : undefined} onTrack={['preparing', 'ready', 'pickedUp'].includes(order.status) ? handleTrack : undefined}/>))}
          </>)}
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: ui_1.DESIGN_TOKENS.colors.border,
    },
    backButton: {
        padding: ui_1.DESIGN_TOKENS.spacing.xs,
    },
    backButtonText: {
        fontSize: 20,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    ordersContainer: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.lg,
    },
    errorText: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.danger,
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
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: ui_1.DESIGN_TOKENS.colors.border,
    },
    secondaryButtonText: {
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
    },
});
exports.default = HistoryScreen;
