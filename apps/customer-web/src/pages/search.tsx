import { useReducer, useCallback, useEffect, CSSProperties } from 'react';
import { Button, Card, DESIGN_TOKENS, SkeletonCard, HomeIcon, CartIcon, ProfileIcon } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { SearchIcon as SearchIconLucide, Filter, MapPin, Star, SlidersHorizontal, WifiOffIcon } from 'lucide-react';
import styles from './search.module.css';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: number;
  address: string;
}

const filters = ['all', 'popular', 'offers', 'nearby', 'rated 4+'] as const;

interface SearchState {
  query: string;
  activeFilter: typeof filters[number];
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
}

const initialSearchState: SearchState = {
  query: '',
  activeFilter: 'all',
  restaurants: [],
  loading: false,
  error: null,
};

function searchReducer(state: SearchState, action: { type: string; payload?: unknown }): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload as string };
    case 'SET_ACTIVE_FILTER':
      return { ...state, activeFilter: action.payload as typeof filters[number] };
    case 'SET_RESTAURANTS':
      return { ...state, restaurants: action.payload as Restaurant[] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload as boolean };
    case 'SET_ERROR':
      return { ...state, error: action.payload as string | null };
    default:
      return state;
  }
}

const SearchPage = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);
  const { enqueueRequest, isOnline, retryFailedRequests } = useOfflineQueue();

  const searchRestaurants = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await enqueueRequest<Restaurant[]>(state.query.trim()
        ? `/restaurants/search?q=${encodeURIComponent(state.query)}`
        : '/restaurants', {
        method: 'GET',
        headers: {}
      });
      dispatch({ type: 'SET_RESTAURANTS', payload: data });
    } catch (error) {
      console.error('Search failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search restaurants. Please check your connection.' });
      dispatch({ type: 'SET_RESTAURANTS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [enqueueRequest, state.query]);

  useEffect(() => {
    const debounceTimer = setTimeout(searchRestaurants, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchRestaurants]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Search</h2>
      </div>

      {!isOnline && (
        <div className={styles.offlineBanner}>
          <WifiOffIcon size={18} />
          <span>You&apos;re offline. Requests will be queued and sent when back online.</span>
        </div>
      )}

      <div className={styles.searchBar}>
        <SearchIconLucide size={20} color={DESIGN_TOKENS.colors.textTertiary} />
        <input
          type="text"
          placeholder="Search restaurants, dishes..."
          aria-label="Search"
          value={state.query}
          onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
          className={styles.searchInput}
        />
        {state.query && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_QUERY', payload: '' })}
            style={{
              border: 'none',
              background: 'transparent',
              color: DESIGN_TOKENS.colors.textTertiary,
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Clear search"
          >
            <SlidersHorizontal size={18} />
          </button>
        )}
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterBar}>
          {filters.map((f) => (
            <button
              type="button"
              key={f}
              className={`${styles.filterChip} ${state.activeFilter === f ? styles.filterChipActive : ''}`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_FILTER', payload: f })}
            >
              {f === 'rated 4+' ? '★ 4+' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {state.error ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>No results found</h3>
          <p className={styles.emptyText}>{state.error}</p>
          <Button label="Retry" onClick={retryFailedRequests} variant="outline" />
        </div>
      ) : state.restaurants.length === 0 && !state.loading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🍽️</div>
          <h3 className={styles.emptyTitle}>No restaurants found</h3>
          <p className={styles.emptyText}>Try changing your search criteria or check back later.</p>
          <Button label="Browse All" onClick={() => router.push('/')} variant="outline" />
        </div>
      ) : (
        <div className={styles.resultsSection}>
          {state.loading ? (
            <SkeletonCard count={3} />
          ) : (
            state.restaurants.map((r) => (
              <Card key={r.id} title={r.name} variant="interactive" onClick={() => router.push(`/restaurant?id=${r.id}`)}>
                <p style={{ fontSize: '0.875rem', color: DESIGN_TOKENS.colors.textSecondary, margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {r.description} · {r.deliveryTime} min · {r.address}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, color: DESIGN_TOKENS.colors.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={16} fill={DESIGN_TOKENS.colors.warning} color={DESIGN_TOKENS.colors.warning} />
                    {r.rating}
                  </div>
                  <Button label="View Menu" onClick={() => router.push(`/restaurant?id=${r.id}`)} size="sm" />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Bottom nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIconLucide, path: '/search' },
          { key: 'orders', label: 'Orders', icon: CartIcon, path: '/history' },
          { key: 'account', label: 'Account', icon: ProfileIcon, path: '/profile' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            className={`${styles.navButton} ${tab.key === 'search' ? styles.navActive : styles.navInactive}`}
            aria-label={tab.label}
          >
            <span className={styles.navIcon}><tab.icon size={22} /></span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SearchPage;
