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
const API_URL = 'http://localhost:3001';
const SearchScreen = () => {
    const navigation = (0, native_1.useNavigation)();
    const [query, setQuery] = (0, react_1.useState)('');
    const [results, setResults] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showFilters, setShowFilters] = (0, react_1.useState)(false);
    const [recentSearches, setRecentSearches] = (0, react_1.useState)([]);
    const [showRecent, setShowRecent] = (0, react_1.useState)(true);
    const [isOffline, setIsOffline] = (0, react_1.useState)(false);
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const slideAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(20)).current;
    (0, react_1.useEffect)(() => {
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
        loadRecentSearches();
    }, [fadeAnim, slideAnim]);
    const loadRecentSearches = async () => {
        try {
            const recent = await async_storage_1.default.getItem(storage_keys_1.STORAGE_KEYS.RECENT_SEARCHES);
            if (recent) {
                const parsed = JSON.parse(recent);
                if (Array.isArray(parsed))
                    setRecentSearches(parsed);
            }
        }
        catch (e) {
            console.error('Failed to load recent searches:', e);
        }
    };
    const saveRecentSearch = (0, react_1.useCallback)(async (searchQuery) => {
        if (!searchQuery.trim())
            return;
        setRecentSearches(prev => {
            const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
            async_storage_1.default.setItem(storage_keys_1.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated)).catch(() => undefined);
            return updated;
        });
    }, []);
    const search = (0, react_1.useCallback)(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setShowRecent(true);
            return;
        }
        setLoading(true);
        setShowRecent(false);
        try {
            const token = await async_storage_1.default.getItem(storage_keys_1.STORAGE_KEYS.AUTH_TOKEN);
            const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            setResults(data.results || []);
            saveRecentSearch(searchQuery);
        }
        catch (error) {
            setResults([]);
            if (error.message.includes('Network')) {
                setIsOffline(true);
            }
        }
        finally {
            setLoading(false);
        }
    }, [saveRecentSearch]);
    const clearRecent = async () => {
        setRecentSearches([]);
        try {
            await async_storage_1.default.removeItem(storage_keys_1.STORAGE_KEYS.RECENT_SEARCHES);
        }
        catch (e) {
            console.error('Failed to clear recent searches:', e);
        }
    };
    const renderSearchResult = ({ item }) => {
        if (item.type === 'restaurant') {
            return (<react_native_1.TouchableOpacity style={styles.resultCard} onPress={() => navigation.navigate('Restaurant', { restaurantId: item.id })}>
          <react_native_1.View style={styles.resultIcon}>
            <react_native_1.Text style={{ fontSize: 24 }}>🍽️</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.resultInfo}>
            <react_native_1.Text style={styles.resultName}>{item.name}</react_native_1.Text>
            <react_native_1.Text style={styles.resultMeta}>
              ⭐ {item.rating} • ⏱ {item.deliveryTime} • 📍 {item.distance}
            </react_native_1.Text>
            {item.description && (<react_native_1.Text style={styles.resultDescription} numberOfLines={1}>
                {item.description}
              </react_native_1.Text>)}
          </react_native_1.View>
        </react_native_1.TouchableOpacity>);
        }
        return (<react_native_1.TouchableOpacity style={styles.resultCard}>
        <react_native_1.View style={styles.resultIcon}>
          <react_native_1.Text style={{ fontSize: 24 }}>🍕</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.resultInfo}>
          <react_native_1.Text style={styles.resultName}>{item.name}</react_native_1.Text>
          <react_native_1.Text style={styles.resultPrice}>₹{item.price}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.TouchableOpacity>);
    };
    const renderSkeleton = () => (<react_native_1.View style={styles.resultCard}>
      <react_native_1.View style={{ width: 50, height: 50, backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated, borderRadius: 8 }}/>
      <react_native_1.View style={{ flex: 1, marginLeft: 12 }}>
        <react_native_1.View style={{ height: 20, backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated, marginBottom: 6, borderRadius: 4 }}/>
        <react_native_1.View style={{ height: 16, backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated, marginBottom: 4, borderRadius: 4 }}/>
        <react_native_1.View style={{ height: 14, backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated, borderRadius: 4 }}/>
      </react_native_1.View>
    </react_native_1.View>);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <react_native_1.Text style={styles.backButtonText}>←</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.Text style={styles.headerText}>Search</react_native_1.Text>
        <react_native_1.TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterButton}>
          <react_native_1.Text style={styles.filterButtonText}>⚙️</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      <react_native_1.View style={styles.searchContainer}>
        <react_native_1.View style={styles.searchBar}>
          <react_native_1.Text style={styles.searchIcon}>🔍</react_native_1.Text>
          <react_native_1.TextInput placeholder="Search restaurants, dishes..." value={query} onChangeText={(text) => {
            setQuery(text);
            if (text.length > 2) {
                search(text);
            }
        }} style={styles.searchInput} autoFocus onSubmitEditing={() => search(query)}/>
          {loading && <react_native_1.ActivityIndicator size="small" color={ui_1.DESIGN_TOKENS.colors.primary}/>}
        </react_native_1.View>

        <react_native_1.Animated.View style={[
            styles.filtersContainer,
            {
                maxHeight: showFilters ? 200 : 0,
                opacity: showFilters ? 1 : 0,
                overflow: 'hidden'
            }
        ]}>
          <react_native_1.Text style={styles.filtersTitle}>Filters</react_native_1.Text>
          <react_native_1.View style={styles.filterRow}>
            <react_native_1.Text style={styles.filterLabel}>Min Rating</react_native_1.Text>
            <react_native_1.TouchableOpacity style={styles.filterOption}>
              <react_native_1.Text style={styles.filterOptionText}>4+ ⭐</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>
          <react_native_1.View style={styles.filterRow}>
            <react_native_1.Text style={styles.filterLabel}>Dietary</react_native_1.Text>
            <react_native_1.View style={styles.dietaryFilters}>
              {['Veg', 'Vegan', 'Gluten-free'].map((diet) => (<react_native_1.TouchableOpacity key={diet} style={styles.dietaryTag}>
                  <react_native_1.Text style={styles.dietaryTagText}>{diet}</react_native_1.Text>
                </react_native_1.TouchableOpacity>))}
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.Animated.View>
      </react_native_1.View>

      <react_native_1.Animated.View style={[
            styles.content,
            {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
            }
        ]}>
        {loading ? (<react_native_1.FlatList data={[1, 2, 3, 4, 5]} keyExtractor={(item) => item.toString()} renderItem={renderSkeleton} ListFooterComponent={<react_native_1.View style={{ height: 80 }}/>}/>) : showRecent ? (<react_native_1.View style={styles.recentContainer}>
            <react_native_1.View style={styles.recentHeader}>
              <react_native_1.Text style={styles.recentTitle}>Recent Searches</react_native_1.Text>
              {recentSearches.length > 0 && (<react_native_1.TouchableOpacity onPress={clearRecent}>
                  <react_native_1.Text style={styles.clearText}>Clear</react_native_1.Text>
                </react_native_1.TouchableOpacity>)}
            </react_native_1.View>
            {recentSearches.length > 0 ? (recentSearches.map((recentItem, index) => (<react_native_1.TouchableOpacity key={index} style={styles.recentItem} onPress={() => {
                    setQuery(recentItem);
                    search(recentItem);
                }}>
                  <react_native_1.Text style={styles.recentIcon}>🕒</react_native_1.Text>
                  <react_native_1.Text style={styles.recentSearchText}>{recentItem}</react_native_1.Text>
                </react_native_1.TouchableOpacity>))) : (<react_native_1.View style={styles.emptyState}>
                <react_native_1.Text style={styles.emptyText}>No recent searches</react_native_1.Text>
                <react_native_1.Text style={styles.emptySubtext}>Search for your favourite food or restaurants</react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.View>) : (<react_native_1.FlatList data={results} keyExtractor={(item) => item.id} renderItem={renderSearchResult} ListEmptyComponent={<react_native_1.View style={styles.emptyState}>
                <react_native_1.Text style={styles.emptyText}>No results found</react_native_1.Text>
                <react_native_1.Text style={styles.emptySubtext}>Try a different search term</react_native_1.Text>
              </react_native_1.View>} ListFooterComponent={<react_native_1.View style={{ height: 80 }}/>}/>)}

        {isOffline && (<react_native_1.View style={styles.offlineBanner}>
            <react_native_1.Text style={styles.offlineText}>📶 You appear to be offline</react_native_1.Text>
            <react_native_1.Text style={styles.offlineSubtext}>Search results may be limited</react_native_1.Text>
          </react_native_1.View>)}
      </react_native_1.Animated.View>
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
    filterButton: {
        padding: ui_1.DESIGN_TOKENS.spacing.xs,
    },
    filterButtonText: {
        fontSize: 20,
    },
    searchContainer: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated,
        borderRadius: ui_1.DESIGN_TOKENS.radius.md,
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: ui_1.DESIGN_TOKENS.spacing.xs,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    filtersContainer: {
        marginTop: ui_1.DESIGN_TOKENS.spacing.md,
    },
    filtersTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        marginBottom: ui_1.DESIGN_TOKENS.spacing.sm,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    filterLabel: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    filterOption: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: ui_1.DESIGN_TOKENS.radius.sm,
    },
    filterOptionText: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    dietaryFilters: {
        flexDirection: 'row',
        gap: 8,
    },
    dietaryTag: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: ui_1.DESIGN_TOKENS.radius.sm,
    },
    dietaryTagText: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    content: {
        flex: 1,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        marginHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        marginVertical: ui_1.DESIGN_TOKENS.spacing.xs,
        borderRadius: ui_1.DESIGN_TOKENS.radius.card,
        padding: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    resultIcon: {
        width: 50,
        height: 50,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultInfo: {
        flex: 1,
        marginLeft: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    resultMeta: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 2,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    resultDescription: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    resultPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
        marginTop: 4,
    },
    recentContainer: {
        flex: 1,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        paddingVertical: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    clearText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: ui_1.DESIGN_TOKENS.colors.border,
    },
    recentIcon: {
        fontSize: 16,
        marginRight: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    recentSearchText: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    emptyState: {
        padding: ui_1.DESIGN_TOKENS.spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginBottom: 8,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    emptySubtext: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    offlineBanner: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.danger + '20',
        padding: 12,
        alignItems: 'center',
    },
    offlineText: {
        color: ui_1.DESIGN_TOKENS.colors.danger,
        fontSize: 14,
        fontWeight: '600',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    offlineSubtext: {
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontSize: 12,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = SearchScreen;
