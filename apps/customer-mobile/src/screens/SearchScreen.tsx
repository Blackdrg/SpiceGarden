import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { safeParse } from '../utils/safe-parse';
import SkeletonRect from '../components/SkeletonLoader';

function renderSkeleton() {
  return (
    <View style={styles.resultCard}>
      <SkeletonRect width={50} height={50} borderRadius={8} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonRect width="70%" height={20} style={{ marginBottom: 6 }} />
        <SkeletonRect width="50%" height={16} style={{ marginBottom: 4 }} />
        <SkeletonRect width="90%" height={14} />
      </View>
    </View>
  );
}

const API_URL = 'http://localhost:3001';

interface SearchResult {
  id: string;
  type: 'restaurant' | 'dish';
  name: string;
  description?: string;
  rating?: number;
  deliveryTime?: string;
  distance?: string;
  price?: number;
  image?: string;
}

const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(20), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: DESIGN_TOKENS.motion.page,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: DESIGN_TOKENS.motion.page,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    loadRecentSearches();
  }, [fadeAnim, slideAnim]);

  const loadRecentSearches = async () => {
    try {
      const recent = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      if (recent) {
        const parsed = safeParse<string[]>(recent);
        if (parsed) setRecentSearches(parsed);
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  };

  const saveRecentSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
      AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated)).catch(() => undefined);
      return updated;
    });
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowRecent(true);
      return;
    }

    setLoading(true);
    setShowRecent(false);

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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
    } catch (error) {
      setResults([]);
      if ((error as Error).message.includes('Network')) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, [saveRecentSearch]);

  const clearRecent = async () => {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch (e) {
      console.error('Failed to clear recent searches:', e);
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'restaurant') {
      return (
        <Pressable 
          style={styles.resultCard}
          onPress={() => navigation.navigate('Restaurant', { restaurantId: item.id })}
          accessibilityLabel={`View ${item.name} restaurant`}
          accessibilityRole="button"
        >
          <View style={styles.resultIcon}>
            <Text style={{ fontSize: 24 }}>Menu</Text>
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultMeta}>
              Rating {item.rating} • ETA {item.deliveryTime} • Distance {item.distance}
            </Text>
            {item.description && (
              <Text style={styles.resultDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable 
        style={styles.resultCard}
        accessibilityLabel={`View ${item.name} dish`}
        accessibilityRole="button"
      >
        <View style={styles.resultIcon}>
          <Text style={{ fontSize: 24 }}>🍕</Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultPrice}>₹{item.price}</Text>
        </View>
      </Pressable>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.resultCard}>
      <SkeletonRect width={50} height={50} borderRadius={8} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonRect width="70%" height={20} style={{ marginBottom: 6 }} />
        <SkeletonRect width="50%" height={16} style={{ marginBottom: 4 }} />
        <SkeletonRect width="90%" height={14} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.headerText}>Search</Text>
        <Pressable 
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
          accessibilityLabel="Toggle filters"
          accessibilityRole="button"
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>Search</Text>
          <TextInput
            placeholder="Search restaurants, dishes..."
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length > 2) {
                search(text);
              }
            }}
            style={styles.searchInput}
            autoFocus
            accessibilityLabel="Search input"
            accessibilityHint="Type to search for restaurants or dishes"
            returnKeyType="search"
            onSubmitEditing={() => search(query)}
          />
          {loading && <ActivityIndicator size="small" color={DESIGN_TOKENS.colors.primary} />}
        </View>

        <Animated.View 
          style={[
            styles.filtersContainer,
            { 
              maxHeight: showFilters ? 200 : 0,
              opacity: showFilters ? 1 : 0,
              overflow: 'hidden'
            }
          ]}
        >
          <Text style={styles.filtersTitle}>Filters</Text>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Min Rating</Text>
            <Pressable 
              style={styles.filterOption}
              accessibilityLabel="Set minimum rating filter"
            >
              <Text style={styles.filterOptionText}>4+ Rating</Text>
            </Pressable>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Dietary</Text>
            <View style={styles.dietaryFilters}>
              {['Veg', 'Vegan', 'Gluten-free'].map((diet) => (
                <Pressable 
                  key={diet}
                  style={styles.dietaryTag}
                  accessibilityLabel={`Filter by ${diet}`}
                >
                  <Text style={styles.dietaryTagText}>{diet}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        {loading ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={renderSkeleton}
            ListFooterComponent={<View style={{ height: 80 }} />}
          />
        ) : showRecent ? (
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <Pressable onPress={clearRecent}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              )}
            </View>
{recentSearches.length > 0 ? (
               recentSearches.map((recentItem, index) => (
                 <Pressable 
                   key={recentItem}
                   style={styles.recentItem}
                   onPress={() => {
                     setQuery(recentItem);
                     search(recentItem);
                   }}
                   accessibilityLabel={`Search for ${recentItem}`}
                 >
                   <Text style={styles.recentIcon}>🕒</Text>
                   <Text style={styles.recentSearchText}>{recentItem}</Text>
                 </Pressable>
               ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent searches</Text>
                <Text style={styles.emptySubtext}>Search for your favourite food or restaurants</Text>
              </View>
            )}
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchResult}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            }
            ListFooterComponent={<View style={{ height: 80 }} />}
          />
        )}

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>📶 You appear to be offline</Text>
            <Text style={styles.offlineSubtext}>Search results may be limited</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  backButtonText: {
    fontSize: 20,
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  filterButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  filterButtonText: {
    fontSize: 20,
  },
  searchContainer: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderRadius: DESIGN_TOKENS.radius.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: DESIGN_TOKENS.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  filtersContainer: {
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  filterOption: {
    backgroundColor: DESIGN_TOKENS.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  filterOptionText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  dietaryFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  dietaryTag: {
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  dietaryTagText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  content: {
    flex: 1,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.sm,
  },
  resultIcon: {
    width: 50,
    height: 50,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: DESIGN_TOKENS.spacing.sm,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  resultMeta: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  resultDescription: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 4,
  },
  recentContainer: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  clearText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  recentIcon: {
    fontSize: 16,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  recentSearchText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyState: {
    padding: DESIGN_TOKENS.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptySubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  offlineBanner: {
    backgroundColor: DESIGN_TOKENS.colors.danger + '20',
    padding: 12,
    alignItems: 'center',
  },
  offlineText: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  offlineSubtext: {
    color: DESIGN_TOKENS.colors.textSecondary,
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default SearchScreen;
