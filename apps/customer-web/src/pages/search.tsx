import React, { useReducer, useCallback } from 'react';
import { Button, Card, DESIGN_TOKENS, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

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

const offlineBannerStyle: React.CSSProperties = {
  backgroundColor: '#fff3e0',
  color: '#f57c00',
  padding: '4px 16px',
  borderRadius: 8,
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: '14px',
};

const bottomNavStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 60,
  backgroundColor: 'white',
  borderTop: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
};

const navButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '12px',
  color: isActive ? DESIGN_TOKENS.colors.primary : '#999',
});

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

  React.useEffect(() => {
    const debounceTimer = setTimeout(searchRestaurants, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchRestaurants]);

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      {!isOnline && (
        <div style={offlineBannerStyle}>
          <span>📵</span>
          <span>You're offline. Requests will be queued and sent when back online.</span>
        </div>
      )}

      <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
      <input
        type="text"
        placeholder="Search restaurants, dishes..."
        aria-label="Search"
        value={state.query}
        onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
        style={{ width: '100%', padding: DESIGN_TOKENS.spacing.md, borderRadius: DESIGN_TOKENS.radius.md, fontSize: '16px', border: '1px solid #ddd' }}
      />
    </div>

    <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, overflowX: 'auto', marginBottom: DESIGN_TOKENS.spacing.lg }}>
      {filters.map((f) => (
        <Button
          key={f}
          label={f.charAt(0).toUpperCase() + f.slice(1)}
          onClick={() => dispatch({ type: 'SET_ACTIVE_FILTER', payload: f })}
          variant={state.activeFilter === f ? 'primary' : 'secondary'}
        />
      ))}
    </div>

    {state.error ? (
      <div style={{ textAlign: 'center', padding: DESIGN_TOKENS.spacing.lg }}>
        <p style={{ color: DESIGN_TOKENS.colors.danger }}>{state.error}</p>
        {!isOnline && (
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: '14px', marginTop: DESIGN_TOKENS.spacing.xs }}>
            You appear to be offline. Your request has been queued and will be sent when you're back online.
          </p>
        )}
        <Button
          label="Retry"
          onClick={retryFailedRequests}
          variant="outline"
        />
      </div>
    ) : state.restaurants.length === 0 ? (
      <div style={{ textAlign: 'center', padding: DESIGN_TOKENS.spacing.lg }}>
        <p style={{ fontSize: '20px', marginBottom: DESIGN_TOKENS.spacing.md }}>🔍</p>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing.sm }}>No restaurants found</p>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: '14px' }}>
          Try changing your search criteria or check your spelling.
        </p>
        <Button
          label="Try Again"
          onClick={() => {
            dispatch({ type: 'SET_LOADING', payload: true });
            setTimeout(() => dispatch({ type: 'SET_LOADING', payload: false }), 1000);
          }}
          variant="outline"
        />
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
        {state.loading ? (
          <SkeletonCard count={3} />
        ) : (
          state.restaurants.map((r) => (
            <Card key={r.id} title={r.name}>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>
                {r.description} &middot; {r.deliveryTime} min &middot; {r.address}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>
                  ⭐ {r.rating}
                </div>
                <Button label="View Menu" onClick={() => router.push(`/restaurant?id=${r.id}`)} />
              </div>
            </Card>
          ))
        )}
      </div>
    )}

    {/* Bottom nav */}
    <nav style={bottomNavStyle}>
      {[{ key: 'home', label: 'Home', icon: '🏠', path: '/' }, { key: 'search', label: 'Search', icon: '🔍' }, { key: 'orders', label: 'Orders', icon: '📦', path: '/history' }, { key: 'account', label: 'Account', icon: '👤', path: '/profile' }].map((tab) => (
        <button
          type="button"
          key={tab.key}
          onClick={() => tab.path && router.push(tab.path)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.path && router.push(tab.path); } }}
          style={navButtonStyle(!tab.path)}
        >
          <span style={{ fontSize: '22px' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
    </div>
  );
};

export default SearchPage;