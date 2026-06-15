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
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const native_1 = require("@react-navigation/native");
const ui_1 = require("@spicegarden/ui");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const HomeScreen = () => {
    const navigation = (0, native_1.useNavigation)();
    const [restaurants, setRestaurants] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    const [user, setUser] = (0, react_1.useState)(null);
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const slideAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        loadRestaurants();
        loadUser();
    }, []);
    const loadRestaurants = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            setRestaurants([
                {
                    id: 'rest-001',
                    name: 'Burger King',
                    description: 'Flame-grilled burgers & fries',
                    rating: 4.2,
                    deliveryTime: '25-30 min',
                    distance: '3.2 km',
                    image: 'https://example.com/burger-king.jpg',
                },
                {
                    id: 'rest-002',
                    name: 'Pizza Hut',
                    description: 'Freshly baked pizzas',
                    rating: 4.5,
                    deliveryTime: '30-35 min',
                    distance: '2.1 km',
                    image: 'https://example.com/pizza-hut.jpg',
                },
                {
                    id: 'rest-003',
                    name: 'Subway',
                    description: 'Fresh made sandwiches',
                    rating: 4.0,
                    deliveryTime: '15-20 min',
                    distance: '1.8 km',
                    image: 'https://example.com/subway.jpg',
                },
            ]);
            setLoading(false);
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: ui_1.DESIGN_TOKENS.motion.page,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: ui_1.DESIGN_TOKENS.motion.page,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }),
            ]).start();
        }
        catch (error) {
            setError('Failed to load restaurants. Pull to refresh.');
            setLoading(false);
            console.error('Failed to load restaurants:', error);
        }
    }, [fadeAnim, slideAnim]);
    const loadUser = (0, react_1.useCallback)(async () => {
        try {
            const userJson = await async_storage_1.default.getItem('sg_user');
            if (userJson) {
                const parsed = JSON.parse(userJson);
                if (parsed && typeof parsed === 'object') {
                    setUser(parsed);
                }
            }
        }
        catch (error) {
            console.error('Failed to load user:', error);
        }
    }, []);
    const handleRefresh = (0, react_1.useCallback)(async () => {
        setRefreshing(true);
        try {
            await loadRestaurants();
        }
        finally {
            setRefreshing(false);
        }
    }, [loadRestaurants]);
    const handleRestaurantPress = (0, react_1.useCallback)((restaurantId) => {
        if (!restaurantId || typeof restaurantId !== 'string')
            return;
        navigation.navigate('Restaurant', { restaurantId });
    }, [navigation]);
    const renderRestaurantItem = (0, react_1.useCallback)(({ item }) => (<react_native_1.TouchableOpacity style={styles.restaurantCard} onPress={() => handleRestaurantPress(item.id)} accessibilityLabel={`View ${item.name} restaurant`} accessibilityRole="button">
      <react_native_1.View style={styles.restaurantInfo}>
        <react_native_1.Text style={styles.restaurantName}>{item.name}</react_native_1.Text>
        <react_native_1.Text style={styles.restaurantDescription} numberOfLines={1}>{item.description}</react_native_1.Text>
        <react_native_1.View style={styles.restaurantMeta}>
          <react_native_1.Text style={styles.metaText}>Rating {item.rating}</react_native_1.Text>
          <react_native_1.Text style={styles.metaText}>• {item.deliveryTime}</react_native_1.Text>
          <react_native_1.Text style={styles.metaText}>• {item.distance}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.TouchableOpacity>), [handleRestaurantPress]);
    const keyExtractor = (0, react_1.useCallback)((item) => item.id, []);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.greeting}>
          Hi {user?.name?.split(' ')[0] || 'Guest'}
        </react_native_1.Text>
        <react_native_1.Text style={styles.deliveryLocation}>Deliver to: Home - Sector 17, Chandigarh</react_native_1.Text>
      </react_native_1.View>

      {loading ? (<react_native_1.View style={styles.loadingContainer}>
          <react_native_1.ActivityIndicator size="large" color={ui_1.DESIGN_TOKENS.colors.primary}/>
        </react_native_1.View>) : error ? (<react_native_1.View style={styles.errorContainer}>
          <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
          <react_native_1.TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <react_native_1.Text style={styles.retryButtonText}>Retry</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>) : (<react_native_1.FlatList data={restaurants} keyExtractor={keyExtractor} renderItem={renderRestaurantItem} contentContainerStyle={styles.listContent} onRefresh={handleRefresh} refreshing={refreshing}/>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
    },
    header: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    deliveryLocation: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
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
    listContent: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
    },
    restaurantCard: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        borderRadius: ui_1.DESIGN_TOKENS.radius.card,
        marginBottom: ui_1.DESIGN_TOKENS.spacing.md,
        overflow: 'hidden',
    },
    restaurantInfo: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    restaurantDescription: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    restaurantMeta: {
        flexDirection: 'row',
        marginTop: 8,
    },
    metaText: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginRight: 8,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});

export default HomeScreen;

