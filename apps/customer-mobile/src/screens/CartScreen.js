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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const native_1 = require("@react-navigation/native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const Haptics = __importStar(require("expo-haptics"));
const ui_1 = require("@spicegarden/ui");
const storage_keys_1 = require("../constants/storage.keys");
const validation_1 = require("../utils/validation");
const CartScreen = () => {
    const navigation = (0, native_1.useNavigation)();
    const [cartItems, setCartItems] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [user, setUser] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        const loadCart = async () => {
            try {
                const userJson = await async_storage_1.default.getItem(storage_keys_1.STORAGE_KEYS.USER);
                if (userJson) {
                    try {
                        const parsedUser = JSON.parse(userJson);
                        setUser(parsedUser);
                    }
                    catch {
                        await async_storage_1.default.removeItem(storage_keys_1.STORAGE_KEYS.USER);
                    }
                }
                const cartJson = await async_storage_1.default.getItem(storage_keys_1.STORAGE_KEYS.CART);
                const parsedCart = cartJson ? JSON.parse(cartJson) : [];
                setCartItems((0, validation_1.validateCart)(parsedCart));
            }
            catch {
                setError('Failed to load cart');
            }
            finally {
                setLoading(false);
                react_native_1.Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: ui_1.DESIGN_TOKENS.motion.page,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }).start();
            }
        };
        loadCart();
    }, [fadeAnim]);
    const removeFromCart = (0, react_1.useCallback)((itemId) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const newCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(newCart);
        async_storage_1.default.setItem(storage_keys_1.STORAGE_KEYS.CART, JSON.stringify(newCart)).catch(() => undefined);
    }, [cartItems]);
    const updateQuantity = (0, react_1.useCallback)((itemId, newQuantity) => {
        const safeQuantity = (0, validation_1.clampQuantity)(newQuantity, 99);
        if (safeQuantity <= 1) {
            removeFromCart(itemId);
            return;
        }
        Haptics.selectionAsync();
        const newCart = cartItems.map(item => item.id === itemId ? { ...item, quantity: safeQuantity } : item);
        setCartItems(newCart);
        async_storage_1.default.setItem(storage_keys_1.STORAGE_KEYS.CART, JSON.stringify(newCart)).catch(() => undefined);
    }, [cartItems, removeFromCart]);
    const calculateSubtotal = (0, react_1.useMemo)(() => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cartItems]);
    const calculateTax = (0, react_1.useCallback)((subtotal) => subtotal * 0.05, []);
    const calculateTotal = (0, react_1.useCallback)(() => {
        return calculateSubtotal + calculateTax(calculateSubtotal);
    }, [calculateSubtotal, calculateTax]);
    const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;
    const handleCheckout = (0, react_1.useCallback)(() => {
        const validCart = (0, validation_1.validateCart)(cartItems);
        if (validCart.length === 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        if (!user) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            navigation.navigate('Auth');
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.navigate('Checkout', { cartItems: validCart });
    }, [cartItems, user, navigation]);
    const renderCartItem = (0, react_1.useCallback)(({ item }) => {
        const validPrice = Math.max(0, item.price || 0);
        const validQty = Math.max(1, item.quantity || 1);
        return (<react_native_1.View style={styles.cartItem}>
        <react_native_1.Image source={{ uri: item.image }} style={styles.cartItemImage}/>
        <react_native_1.View style={styles.cartItemInfo}>
          <react_native_1.Text style={styles.cartItemName}>{item.name}</react_native_1.Text>
          <react_native_1.Text style={styles.cartItemDescription} numberOfLines={2}>{item.description}</react_native_1.Text>
          <react_native_1.View style={styles.cartItemQuantity}>
            <react_native_1.TouchableOpacity onPress={() => updateQuantity(item.id, validQty - 1)} style={styles.quantityButton}>
              <react_native_1.Text style={styles.quantityButtonText}>-</react_native_1.Text>
            </react_native_1.TouchableOpacity>
            <react_native_1.Text style={styles.quantityText}>{validQty}</react_native_1.Text>
            <react_native_1.TouchableOpacity onPress={() => updateQuantity(item.id, validQty + 1)} style={styles.quantityButton}>
              <react_native_1.Text style={styles.quantityButtonText}>+</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>
          <react_native_1.Text style={styles.cartItemPrice}>{formatCurrency(validPrice * validQty)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
          <react_native_1.Text style={styles.removeButtonText}>X</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>);
    }, [updateQuantity, removeFromCart]);
    const keyExtractor = (0, react_1.useCallback)((item) => item.id, []);
    const totalFormatted = formatCurrency(calculateTotal());
    if (loading) {
        return (<react_native_1.View style={styles.loadingContainer}>
        <react_native_1.Animated.View style={{ opacity: fadeAnim }}>
          <react_native_1.ActivityIndicator size="large" color={ui_1.DESIGN_TOKENS.colors.primary}/>
          <react_native_1.Text style={styles.loadingText}>Loading your cart...</react_native_1.Text>
        </react_native_1.Animated.View>
      </react_native_1.View>);
    }
    if (error) {
        return (<react_native_1.View style={styles.errorContainer}>
        <react_native_1.Text style={styles.errorIcon}>Alert</react_native_1.Text>
        <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
        <react_native_1.TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton}>
          <react_native_1.Text style={styles.buttonText}>Browse Restaurants</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>);
    }
    return (<react_native_1.Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <react_native_1.View style={styles.container}>
        <react_native_1.View style={styles.header}>
          <react_native_1.TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <react_native_1.Text style={styles.backButtonText}>Back</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.Text style={styles.headerText}>Your Cart</react_native_1.Text>
          <react_native_1.View style={{ width: 40 }}/>
        </react_native_1.View>

        {cartItems.length === 0 ? (<react_native_1.View style={styles.emptyCart}>
            <react_native_1.View style={styles.emptyIconContainer}>
              <react_native_1.Text style={styles.emptyIcon}>Cart</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Text style={styles.emptyText}>Your cart is empty</react_native_1.Text>
            <react_native_1.Text style={styles.emptySubtext}>Add some delicious food to get started</react_native_1.Text>
            <react_native_1.TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton}>
              <react_native_1.Text style={styles.buttonText}>Browse Restaurants</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>) : (<>
            <react_native_1.FlatList data={cartItems} keyExtractor={keyExtractor} renderItem={renderCartItem} contentContainerStyle={{ flexGrow: 1 }} ListFooterComponent={<react_native_1.View style={styles.summarySection}>
                  <react_native_1.View style={styles.summaryRow}>
                    <react_native_1.Text style={styles.summaryLabel}>Subtotal</react_native_1.Text>
                    <react_native_1.Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal)}</react_native_1.Text>
                  </react_native_1.View>
                  <react_native_1.View style={styles.summaryRow}>
                    <react_native_1.Text style={styles.summaryLabel}>Tax (5%)</react_native_1.Text>
                    <react_native_1.Text style={styles.summaryValue}>{formatCurrency(calculateTax(calculateSubtotal))}</react_native_1.Text>
                  </react_native_1.View>
                  <react_native_1.View style={[styles.summaryRow, styles.totalRow]}>
                    <react_native_1.Text style={styles.totalLabel}>Total</react_native_1.Text>
                    <react_native_1.Text style={styles.totalAmount}>{totalFormatted}</react_native_1.Text>
                  </react_native_1.View>
                </react_native_1.View>}/>
            <react_native_1.View style={styles.cartFooter}>
              <react_native_1.TouchableOpacity onPress={handleCheckout} style={styles.checkoutButton}>
                <react_native_1.Text style={styles.checkoutButtonText}>Proceed to Checkout</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </>)}
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: { flex: 1, backgroundColor: ui_1.DESIGN_TOKENS.colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: ui_1.DESIGN_TOKENS.colors.background },
    loadingText: { fontSize: 16, color: ui_1.DESIGN_TOKENS.colors.textSecondary, marginTop: 16, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: ui_1.DESIGN_TOKENS.spacing.lg },
    errorIcon: { fontSize: 48, marginBottom: ui_1.DESIGN_TOKENS.spacing.md },
    errorText: { fontSize: 16, color: ui_1.DESIGN_TOKENS.colors.danger, textAlign: 'center', marginBottom: 20, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: ui_1.DESIGN_TOKENS.spacing.md, backgroundColor: ui_1.DESIGN_TOKENS.colors.surface, borderBottomWidth: 1, borderBottomColor: ui_1.DESIGN_TOKENS.colors.border },
    backButton: { padding: ui_1.DESIGN_TOKENS.spacing.xs },
    backButtonText: { fontSize: 20, color: ui_1.DESIGN_TOKENS.colors.textPrimary },
    headerText: { fontSize: 20, fontWeight: '600', color: ui_1.DESIGN_TOKENS.colors.textPrimary, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    emptyCart: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: ui_1.DESIGN_TOKENS.spacing.lg },
    emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated, justifyContent: 'center', alignItems: 'center', marginBottom: ui_1.DESIGN_TOKENS.spacing.lg },
    emptyIcon: { fontSize: 40 },
    emptyText: { fontSize: 18, color: ui_1.DESIGN_TOKENS.colors.textPrimary, marginBottom: 8, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily, fontWeight: '600' },
    emptySubtext: { fontSize: 14, color: ui_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: 20, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily, textAlign: 'center' },
    primaryButton: { backgroundColor: ui_1.DESIGN_TOKENS.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: ui_1.DESIGN_TOKENS.radius.button },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    cartItem: { flexDirection: 'row', backgroundColor: ui_1.DESIGN_TOKENS.colors.surface, marginHorizontal: ui_1.DESIGN_TOKENS.spacing.md, marginVertical: ui_1.DESIGN_TOKENS.spacing.xs, borderRadius: ui_1.DESIGN_TOKENS.radius.card, overflow: 'hidden', elevation: 2, padding: ui_1.DESIGN_TOKENS.spacing.sm },
    cartItemImage: { width: 80, height: 80 },
    cartItemInfo: { flex: 1, marginLeft: ui_1.DESIGN_TOKENS.spacing.sm, justifyContent: 'space-between' },
    cartItemName: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: ui_1.DESIGN_TOKENS.colors.textPrimary, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    cartItemDescription: { fontSize: 14, color: ui_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: 8, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    cartItemQuantity: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: { width: 32, height: 32, borderWidth: 1, borderColor: ui_1.DESIGN_TOKENS.colors.border, justifyContent: 'center', alignItems: 'center', borderRadius: ui_1.DESIGN_TOKENS.radius.sm },
    quantityButtonText: { fontSize: 18, fontWeight: '600', color: ui_1.DESIGN_TOKENS.colors.textPrimary },
    quantityText: { marginHorizontal: ui_1.DESIGN_TOKENS.spacing.sm, fontSize: 16, fontWeight: '500', minWidth: 24, textAlign: 'center', fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    cartItemPrice: { fontSize: 16, fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.primary, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    removeButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, justifyContent: 'center', alignItems: 'center' },
    removeButtonText: { fontSize: 14, color: ui_1.DESIGN_TOKENS.colors.dangerDark, fontWeight: '500' },
    cartFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: ui_1.DESIGN_TOKENS.colors.surface, padding: ui_1.DESIGN_TOKENS.spacing.md, borderTopWidth: 1, borderTopColor: ui_1.DESIGN_TOKENS.colors.border },
    checkoutButton: { backgroundColor: ui_1.DESIGN_TOKENS.colors.primary, paddingVertical: 14, borderRadius: ui_1.DESIGN_TOKENS.radius.button, alignItems: 'center' },
    checkoutButtonText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    summarySection: { padding: ui_1.DESIGN_TOKENS.spacing.md, backgroundColor: ui_1.DESIGN_TOKENS.colors.surface, marginHorizontal: ui_1.DESIGN_TOKENS.spacing.md, borderRadius: ui_1.DESIGN_TOKENS.radius.card, marginTop: ui_1.DESIGN_TOKENS.spacing.sm },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: ui_1.DESIGN_TOKENS.colors.textSecondary, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    summaryValue: { fontSize: 14, color: ui_1.DESIGN_TOKENS.colors.textPrimary, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: ui_1.DESIGN_TOKENS.colors.border },
    totalLabel: { fontSize: 16, fontWeight: '600', color: ui_1.DESIGN_TOKENS.colors.textPrimary, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
    totalAmount: { fontSize: 18, fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.textPrimary, fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily },
});
exports.default = CartScreen;
