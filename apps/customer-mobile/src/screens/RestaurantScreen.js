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
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const native_1 = require("@react-navigation/native");
const ui_1 = require("@spicegarden/ui");
const RestaurantScreen = () => {
    const navigation = (0, native_1.useNavigation)();
    const [restaurant, setRestaurant] = (0, react_1.useState)(null);
    const [menuItems, setMenuItems] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = (0, react_1.useCallback)(async () => {
        try {
            setRestaurant({
                id: 'rest-001',
                name: 'Burger King',
                rating: 4.2,
                deliveryTime: '25-30 min',
                address: 'Phase 5, Mohali',
            });
            setMenuItems([
                { id: 'item-001', name: 'Whopper', description: 'Flame-grilled beef patty with fresh lettuce', price: 149, category: 'burgers', image: 'https://example.com/whopper.jpg' },
                { id: 'item-002', name: 'Double Whopper', description: 'Two flame-grilled beef patties', price: 199, category: 'burgers', image: 'https://example.com/double-whopper.jpg' },
            ]);
            setLoading(false);
            react_native_1.Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                useNativeDriver: true,
            }).start();
        }
        catch (error) {
            setError('Failed to load menu');
            setLoading(false);
        }
    }, [fadeAnim]);
    const handleAddToCart = (item) => {
        // Add to cart logic would go here
        console.log('Add to cart:', item.name);
    };
    const renderMenuItem = ({ item }) => (<react_native_1.TouchableOpacity style={styles.menuItem} onPress={() => handleAddToCart(item)} accessibilityLabel={`Add ${item.name} to cart`} accessibilityRole="button">
      <react_native_1.View style={styles.menuItemInfo}>
        <react_native_1.Text style={styles.menuItemName}>{item.name}</react_native_1.Text>
        <react_native_1.Text style={styles.menuItemDescription} numberOfLines={2}>{item.description}</react_native_1.Text>
        <react_native_1.Text style={styles.menuItemPrice}>₹{item.price}</react_native_1.Text>
      </react_native_1.View>
    </react_native_1.TouchableOpacity>);
    if (loading) {
        return (<react_native_1.View style={styles.loadingContainer}>
        <react_native_1.ActivityIndicator size="large" color={ui_1.DESIGN_TOKENS.colors.primary}/>
      </react_native_1.View>);
    }
    if (error) {
        return (<react_native_1.View style={styles.errorContainer}>
        <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
        <react_native_1.TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <react_native_1.Text style={styles.retryButtonText}>Retry</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>);
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back" accessibilityRole="button">
          <react_native_1.Text style={styles.backButtonText}>Back</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.Text style={styles.headerText}>{restaurant?.name || 'Restaurant'}</react_native_1.Text>
      </react_native_1.View>

      <react_native_1.Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <react_native_1.View style={styles.restaurantInfo}>
          <react_native_1.Text style={styles.restaurantRating}>Rating {restaurant?.rating || 0}</react_native_1.Text>
          <react_native_1.Text style={styles.restaurantDeliveryTime}>{restaurant?.deliveryTime || ''}</react_native_1.Text>
          <react_native_1.Text style={styles.restaurantAddress}>{restaurant?.address || ''}</react_native_1.Text>
        </react_native_1.View>

        <react_native_1.View style={styles.menuSection}>
          <react_native_1.Text style={styles.sectionTitle}>Menu</react_native_1.Text>
          <react_native_1.FlatList data={menuItems} keyExtractor={(item) => item.id} renderItem={renderMenuItem} contentContainerStyle={styles.listContent}/>
        </react_native_1.View>
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: ui_1.DESIGN_TOKENS.spacing.md,
        textAlign: 'center',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    retryButton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    header: {
        flexDirection: 'row',
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
        marginLeft: ui_1.DESIGN_TOKENS.spacing.md,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    restaurantInfo: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
    },
    restaurantRating: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    restaurantDeliveryTime: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    restaurantAddress: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    menuSection: {
        flex: 1,
        padding: ui_1.DESIGN_TOKENS.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: ui_1.DESIGN_TOKENS.spacing.md,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    listContent: {
        paddingBottom: 20,
    },
    menuItem: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        borderRadius: ui_1.DESIGN_TOKENS.radius.card,
        marginBottom: ui_1.DESIGN_TOKENS.spacing.sm,
        overflow: 'hidden',
    },
    menuItemInfo: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    menuItemDescription: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.primary,
        marginTop: 8,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = RestaurantScreen;
