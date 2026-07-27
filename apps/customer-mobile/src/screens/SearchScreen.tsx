import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { API_URL } from '../constants/api';
import { safeParse } from '../utils/safe-parse';
import SkeletonRect from '../components/SkeletonLoader';

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

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(20);
  const skeletonData = useMemo(() => [1, 2, 3, 4, 5], []);

  useEffect(() => {
    let cancelled = false;
    const loadRecentSearches = async () => {
      try {
        const recent = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
        if (cancelled) return;
        if (recent) {
          const parsed = safeParse<string[]>(recent);
          if (parsed) setRecentSearches(parsed);
        }
      } catch (e) {
        if (!cancelled) console.error('Failed to load recent searches:', e);
      }
    };

    loadRecentSearches();
    return () => { cancelled = true; };
  }, [fadeAnim, slideAnim]);

  const saveRecentSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated)).catch(() => undefined);
  }, [recentSearches]);

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
            <Ionicons name="restaurant-outline" size={24} color={DESIGN_TOKENS.colors.primary} />
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
          <Ionicons name="chevron-forward" size={20} color={DESIGN_TOKENS.colors.textTertiary} />
        </Pressable>
      );
    }

    return (
      <Pressable 
        style={styles.resultCard}
        accessibilityLabel={`View ${item.name} dish`}
        accessibilityRole="button"
      >
        <View style={[styles.resultIcon, styles.dishResultIcon]}>
          <Ionicons name="pizza-outline" size={24} color={DESIGN_TOKENS.colors.primary} />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultPrice}>₹{item.price}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={DESIGN_TOKENS.colors.textTertiary} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={DESIGN_TOKENS.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerText}>Search</Text>
        <Pressable 
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
          accessibilityLabel="Toggle filters"
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={22} color={DESIGN_TOKENS.colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={DESIGN_TOKENS.colors.textTertiary} />
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
            data={skeletonData}
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
                    <Ionicons name="time-outline" size={18} color={DESIGN_TOKENS.colors.textTertiary} />
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
            <Ionicons name="wifi-outline" size={20} color={DESIGN_TOKENS.colors.danger} />
            <View style={styles.offlineTextContainer}>
              <Text style={styles.offlineText}>You appear to be offline</Text>
              <Text style={styles.offlineSubtext}>Search results may be limited</Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
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
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderRadius: DESIGN_TOKENS.radius.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    height: 48,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  filtersContainer: {
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  filtersTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DESIGN_TOKENS.radius.full,
  },
  filterOptionText: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  dietaryFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  dietaryTag: {
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DESIGN_TOKENS.radius.full,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  dietaryTagText: {
    fontSize: 13,
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
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  resultIcon: {
    width: 48,
    height: 48,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    borderRadius: DESIGN_TOKENS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishResultIcon: {
    backgroundColor: DESIGN_TOKENS.colors.successLight,
  },
  resultInfo: {
    flex: 1,
    marginLeft: DESIGN_TOKENS.spacing.sm,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  resultMeta: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    lineHeight: 16,
  },
  resultDescription: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
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
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  clearText: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  recentIcon: {
    fontSize: 16,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  recentSearchText: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyState: {
    padding: DESIGN_TOKENS.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptySubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
  offlineBanner: {
    backgroundColor: DESIGN_TOKENS.colors.dangerLight,
    padding: DESIGN_TOKENS.spacing.md,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  offlineTextContainer: {
    flex: 1,
  },
  offlineText: {
    color: DESIGN_TOKENS.colors.dangerDark,
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
