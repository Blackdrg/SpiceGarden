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
const react_1 = __importStar(require("react"));
const ui_1 = require("@spicegarden/ui");
const router_1 = require("next/router");
const react_redux_1 = require("react-redux");
const HomePage = () => {
    const router = (0, router_1.useRouter)();
    const user = (0, react_redux_1.useSelector)((state) => state.auth.user);
    const [restaurants, setRestaurants] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const activeTab = (0, react_1.useMemo)(() => {
        if (router.pathname === '/')
            return 'home';
        if (router.pathname === '/search')
            return 'search';
        if (router.pathname === '/history')
            return 'orders';
        if (router.pathname === '/profile')
            return 'account';
        return '';
    }, [router.pathname]);
    (0, react_1.useEffect)(() => {
        const loadRestaurants = async () => {
            try {
                const response = await fetch('/api/restaurants');
                if (!response.ok)
                    throw new Error('Failed to load restaurants');
                const data = await response.json();
                setRestaurants(data);
            }
            catch (error) {
                console.error('Failed to load restaurants:', error);
                setError('Unable to load restaurants. Please check your connection.');
                setRestaurants([]);
            }
            finally {
                setLoading(false);
            }
        };
        loadRestaurants();
    }, []);
    const handleRetry = () => {
        setLoading(true);
        setError(null);
        window.location.reload();
    };
    const categories = (0, react_1.useMemo)(() => [
        { name: 'Burgers', icon: '🍔' },
        { name: 'Pizza', icon: '🍕' },
        { name: 'Drinks', icon: '🥤' },
        { name: 'Dessert', icon: '🍰' },
        { name: 'Healthy', icon: '🥗' },
    ], []);
    const containerStyle = {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
        minHeight: '100vh',
        paddingBottom: 80,
    };
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: ui_1.DESIGN_TOKENS.spacing.lg,
    };
    const searchBarStyle = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        padding: `12px ${ui_1.DESIGN_TOKENS.spacing.md}px`,
        borderRadius: ui_1.DESIGN_TOKENS.radius.md,
        marginBottom: ui_1.DESIGN_TOKENS.spacing.lg,
        boxShadow: ui_1.DESIGN_TOKENS.shadows.small,
    };
    return (<div style={containerStyle}>
      <header style={headerStyle} role="banner">
        <div>
          <h2 style={{
            margin: 0,
            ...ui_1.DESIGN_TOKENS.typography.headingS,
            color: ui_1.DESIGN_TOKENS.colors.textPrimary
        }}>
            👋 {user?.name?.split(' ')[0] || 'Guest'}
          </h2>
          <p style={{
            margin: 0,
            color: ui_1.DESIGN_TOKENS.colors.textSecondary,
            fontSize: '14px',
            marginTop: 4
        }}>
            Deliver to: Home - Sector 17, Chandigarh
          </p>
        </div>
        <ui_1.Button label="🔔" onClick={() => null} variant="secondary" ariaLabel="Notifications"/>
      </header>

      <div onClick={() => router.push('/search')} style={searchBarStyle} role="button" tabIndex={0} aria-label="Search restaurants and dishes">
        <span style={{ color: '#bbb', marginRight: 8, fontSize: 18 }}>🔍</span>
        <span style={{ color: '#aaa', fontSize: '15px' }}>Search restaurants, dishes…</span>
      </div>

      <div style={{
            display: 'flex',
            gap: ui_1.DESIGN_TOKENS.spacing.sm,
            overflowX: 'auto',
            paddingBottom: ui_1.DESIGN_TOKENS.spacing.sm,
            marginBottom: ui_1.DESIGN_TOKENS.spacing.lg
        }}>
        {categories.map((cat) => (<div key={cat.name} style={{
                textAlign: 'center',
                minWidth: '64px',
                padding: ui_1.DESIGN_TOKENS.spacing.sm,
                backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
                borderRadius: ui_1.DESIGN_TOKENS.radius.md,
                cursor: 'pointer',
                boxShadow: ui_1.DESIGN_TOKENS.shadows.small
            }} role="button" tabIndex={0} aria-label={`Browse ${cat.name} category`}>
            <div style={{ fontSize: '28px' }}>{cat.icon}</div>
            <div style={{ fontSize: '12px', color: ui_1.DESIGN_TOKENS.colors.textSecondary }}>{cat.name}</div>
          </div>))}
      </div>

      <div style={{
            background: `linear-gradient(45deg, ${ui_1.DESIGN_TOKENS.colors.primary}, #ff7e5f)`,
            color: 'white',
            padding: ui_1.DESIGN_TOKENS.spacing.lg,
            borderRadius: ui_1.DESIGN_TOKENS.radius.card,
            marginBottom: ui_1.DESIGN_TOKENS.spacing.xl,
            cursor: 'pointer',
        }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🎉 50% OFF</h2>
        <p style={{ margin: '8px 0 16px 0', fontSize: '14px' }}>
          On your first 3 orders. Use code: <strong>WELCOME50</strong>
        </p>
        <ui_1.Button label="Order Now" onClick={() => router.push('/search')} ariaLabel="Order now with welcome discount"/>
      </div>

      <ui_1.Card title="Recommended Restaurants" variant="elevated">
        {loading ? (<ui_1.SkeletonCard count={3}/>) : error ? (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md }}>
            <p style={{ color: ui_1.DESIGN_TOKENS.colors.danger }}>{error}</p>
            <button type="button" onClick={handleRetry} style={{
                marginTop: ui_1.DESIGN_TOKENS.spacing.sm,
                padding: `${ui_1.DESIGN_TOKENS.spacing.xs}px ${ui_1.DESIGN_TOKENS.spacing.sm}px`,
                backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: ui_1.DESIGN_TOKENS.radius.md,
                cursor: 'pointer'
            }}>
              Retry
            </button>
          </div>) : restaurants.length === 0 ? (<p style={{ color: ui_1.DESIGN_TOKENS.colors.textSecondary, padding: ui_1.DESIGN_TOKENS.spacing.md }}>
            No restaurants available right now
          </p>) : (<div style={{ display: 'grid', gap: ui_1.DESIGN_TOKENS.spacing.md }}>
            {restaurants.slice(0, 3).map((restaurant) => (<div key={restaurant.id} style={{
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    padding: ui_1.DESIGN_TOKENS.spacing.sm,
                    borderRadius: ui_1.DESIGN_TOKENS.radius.md,
                    transition: `background-color ${ui_1.DESIGN_TOKENS.motion.standard}ms ${ui_1.MOTION_EASING.easeInOut}`,
                }} onClick={() => router.push(`/restaurant?id=${restaurant.id}`)} role="button" tabIndex={0} aria-label={`View ${restaurant.name} details`}>
                <div style={{ fontSize: '32px' }}>🍽️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.textPrimary }}>
                    {restaurant.name}
                  </div>
                  <div style={{ fontSize: '12px', color: ui_1.DESIGN_TOKENS.colors.textSecondary }}>
                    {restaurant.description}
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: '12px', color: ui_1.DESIGN_TOKENS.colors.textSecondary }}>
                    <span>⭐ {restaurant.rating}</span>
                    <span>• {restaurant.deliveryTime} min</span>
                    <span>• {Math.round(Math.random() * 5)} km</span>
                  </div>
                </div>
              </div>))}
          </div>)}
      </ui_1.Card>

      <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
            borderTop: `1px solid ${ui_1.DESIGN_TOKENS.colors.border}`,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            boxShadow: ui_1.DESIGN_TOKENS.shadows.small,
        }} role="navigation" aria-label="Main navigation">
        {[
            { key: 'home', label: 'Home', icon: '🏠', path: '/' },
            { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
            { key: 'orders', label: 'Orders', icon: '📦', path: '/history' },
            { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (<div key={tab.key} onClick={() => tab.path && router.push(tab.path)} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: activeTab === tab.key ? ui_1.DESIGN_TOKENS.colors.primary : '#999',
                fontSize: '11px'
            }} role="tab" aria-label={tab.label}>
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>))}
      </nav>
    </div>);
};
exports.default = HomePage;
