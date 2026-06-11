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
const ui_1 = require("@spicegarden/ui");
const storage_keys_1 = require("../constants/storage.keys");
const CheckoutScreen = () => {
    const navigation = (0, native_1.useNavigation)();
    const [address, setAddress] = (0, react_1.useState)('');
    const [cartItems] = (0, react_1.useState)([]);
    const [tip, setTip] = (0, react_1.useState)(0);
    const [promoCode, setPromoCode] = (0, react_1.useState)('');
    const [promoError, setPromoError] = (0, react_1.useState)('');
    const [promoMessage, setPromoMessage] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [paymentMethod, setPaymentMethod] = (0, react_1.useState)('card');
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const scaleAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    (0, react_1.useEffect)(() => {
        const loadAddress = async () => {
            try {
                const addressJson = await async_storage_1.default.getItem(storage_keys_1.STORAGE_KEYS.ADDRESS);
                if (addressJson && addressJson.trim().length > 0) {
                    setAddress(addressJson);
                }
            }
            catch (e) {
                console.error('Failed to load address:', e);
            }
            react_native_1.Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        };
        loadAddress();
    }, [fadeAnim]);
    const handlePlaceOrder = async () => {
        setLoading(true);
        react_native_1.Animated.sequence([
            react_native_1.Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 150,
                easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();
        try {
            await async_storage_1.default.removeItem(storage_keys_1.STORAGE_KEYS.CART);
            const orderId = 'SG' + Math.floor(Math.random() * 900000 + 100000).toString();
            navigation.navigate('Tracking', { orderId });
        }
        catch {
            navigation.navigate('Tracking');
        }
        finally {
            setLoading(false);
        }
    };
    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };
    const calculateTax = (rate = 0.05) => {
        return calculateSubtotal() * rate;
    };
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = subtotal * 0.05;
        return subtotal + tax + tip;
    };
    const applyPromo = () => {
        if (promoCode.trim() === '') {
            setPromoError('Enter a promo code');
            setPromoMessage('');
        }
        else {
            setPromoError('');
            setPromoMessage('Promo applied');
        }
    };
    if (cartItems.length === 0) {
        return (<react_native_1.View style={styles.emptyContainer}>
        <react_native_1.Text style={styles.emptyText}>Your cart is empty</react_native_1.Text>
        <react_native_1.TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton}>
          <react_native_1.Text style={styles.primaryButtonText}>Browse Restaurants</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>);
    }
    return (<react_native_1.Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <react_native_1.View style={styles.container}>
        <react_native_1.View style={styles.header}>
          <react_native_1.TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <react_native_1.Text style={styles.backButtonText}>?</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.Text style={styles.headerText}>Checkout</react_native_1.Text>
        </react_native_1.View>
        
        <react_native_1.ScrollView style={styles.content}>
          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>Delivery Address</react_native_1.Text>
            <react_native_1.View style={styles.addressRow}>
              <react_native_1.Text style={styles.addressText}>{address}</react_native_1.Text>
              <react_native_1.TouchableOpacity style={styles.editButton}>
                <react_native_1.Text style={styles.editButtonText}>Change</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </react_native_1.View>

          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>Payment Method</react_native_1.Text>
            <react_native_1.View style={styles.paymentOptions}>
              {['card', 'upi', 'cash'].map(method => (<react_native_1.TouchableOpacity key={method} onPress={() => setPaymentMethod(method)} style={[styles.paymentOption, paymentMethod === method && styles.selectedPaymentOption]}>
                  <react_native_1.Text style={styles.paymentOptionText}>
                    {method === 'card' ? '?? Card' : method === 'upi' ? '?? UPI' : '?? Cash'}
                  </react_native_1.Text>
                </react_native_1.TouchableOpacity>))}
            </react_native_1.View>
          </react_native_1.View>

          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>Tip</react_native_1.Text>
            <react_native_1.View style={styles.tipOptions}>
              {[0, 30, 50, 100].map(tipAmount => (<react_native_1.TouchableOpacity key={tipAmount} onPress={() => setTip(tipAmount)} style={[styles.tipOption, tip === tipAmount && styles.selectedTipOption]}>
                  <react_native_1.Text style={styles.tipOptionText}>{tipAmount === 0 ? 'No tip' : `?${tipAmount}`}</react_native_1.Text>
                </react_native_1.TouchableOpacity>))}
            </react_native_1.View>
          </react_native_1.View>

          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>Promo Code</react_native_1.Text>
            <react_native_1.View style={styles.promoRow}>
              <react_native_1.TextInput placeholder="Enter promo code" value={promoCode} onChangeText={setPromoCode} style={styles.promoInput}/>
              <react_native_1.TouchableOpacity onPress={applyPromo} style={styles.promoButton}>
                <react_native_1.Text style={styles.promoButtonText}>Apply</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
            {promoError && <react_native_1.Text style={styles.promoError}>{promoError}</react_native_1.Text>}
            {promoMessage && <react_native_1.Text style={styles.promoSuccess}>{promoMessage}</react_native_1.Text>}
          </react_native_1.View>

          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>Order Summary</react_native_1.Text>
            <react_native_1.View style={styles.summaryRow}>
              <react_native_1.Text style={styles.summaryLabel}>Item Total</react_native_1.Text>
              <react_native_1.Text style={styles.summaryAmount}>?{calculateSubtotal().toFixed(0)}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.summaryRow}>
              <react_native_1.Text style={styles.summaryLabel}>Tax</react_native_1.Text>
              <react_native_1.Text style={styles.summaryAmount}>?{calculateTax().toFixed(0)}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <react_native_1.Text style={styles.summaryLabelTotal}>Total</react_native_1.Text>
              <react_native_1.Text style={styles.summaryAmountTotal}>?{calculateTotal().toFixed(0)}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.ScrollView>
        
        <react_native_1.TouchableOpacity onPress={handlePlaceOrder} style={[styles.placeOrderButton, loading && styles.buttonLoading]}>
          <react_native_1.Text style={styles.placeOrderButtonText}>{loading ? 'Processing...' : `Place Order � ?${calculateTotal().toFixed(0)}`}</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginBottom: 20,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    primaryButton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
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
    content: {
        flex: 1,
    },
    section: {
        marginHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        marginVertical: ui_1.DESIGN_TOKENS.spacing.sm,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        borderRadius: ui_1.DESIGN_TOKENS.radius.card,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    addressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.md,
    },
    addressText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        flex: 1,
        marginRight: ui_1.DESIGN_TOKENS.spacing.md,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    editButtonText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontWeight: '500',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    paymentOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    paymentOption: {
        padding: 12,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: ui_1.DESIGN_TOKENS.colors.border,
        borderRadius: ui_1.DESIGN_TOKENS.radius.md,
    },
    selectedPaymentOption: {
        borderColor: ui_1.DESIGN_TOKENS.colors.primary,
        backgroundColor: `${ui_1.DESIGN_TOKENS.colors.primary}10`,
    },
    paymentOptionText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    tipOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    tipOption: {
        padding: 12,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: ui_1.DESIGN_TOKENS.colors.border,
        borderRadius: ui_1.DESIGN_TOKENS.radius.md,
    },
    selectedTipOption: {
        borderColor: ui_1.DESIGN_TOKENS.colors.primary,
        backgroundColor: `${ui_1.DESIGN_TOKENS.colors.primary}10`,
    },
    tipOptionText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    promoRow: {
        flexDirection: 'row',
        padding: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    promoInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: ui_1.DESIGN_TOKENS.colors.border,
        borderRadius: ui_1.DESIGN_TOKENS.radius.sm,
        paddingHorizontal: 8,
        marginRight: 8,
        fontSize: 16,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    promoButton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: ui_1.DESIGN_TOKENS.radius.sm,
        justifyContent: 'center',
    },
    promoButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    promoError: {
        color: ui_1.DESIGN_TOKENS.colors.danger,
        fontSize: 12,
        marginTop: 4,
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.sm,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    promoSuccess: {
        color: ui_1.DESIGN_TOKENS.colors.success,
        fontSize: 12,
        marginTop: 4,
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.sm,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        paddingVertical: 8,
    },
    summaryRowTotal: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: ui_1.DESIGN_TOKENS.colors.border,
    },
    summaryLabel: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    summaryAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    summaryLabelTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    summaryAmountTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    placeOrderButton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        paddingVertical: 16,
        margin: ui_1.DESIGN_TOKENS.spacing.md,
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
        alignItems: 'center',
    },
    buttonLoading: {
        opacity: 0.7,
    },
    placeOrderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = CheckoutScreen;
