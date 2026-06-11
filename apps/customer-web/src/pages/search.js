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
const useOfflineQueue_1 = require("../hooks/useOfflineQueue");
const SearchPage = () => {
    const router = (0, router_1.useRouter)();
    const [query, setQuery] = (0, react_1.useState)('');
    const [activeFilter, setActiveFilter] = (0, react_1.useState)('all');
    const [restaurants, setRestaurants] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const { enqueueRequest, isOnline, retryFailedRequests } = (0, useOfflineQueue_1.useOfflineQueue)();
    (0, react_1.useEffect)(() => {
        const searchRestaurants = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use offline queue for API requests
                const data = await enqueueRequest(query.trim()
                    ? `/restaurants/search?q=${encodeURIComponent(query)}`
                    : '/restaurants', {
                    method: 'GET',
                    headers: {} // Add unknown needed headers here
                });
                setRestaurants(data);
            }
            catch (error) {
                console.error('Search failed:', error);
                setError('Failed to search restaurants. Please check your connection.');
                setRestaurants([]);
            }
            finally {
                setLoading(false);
            }
        };
        const debounceTimer = setTimeout(searchRestaurants, 300);
        return () => clearTimeout(debounceTimer);
    }, [query, enqueueRequest]);
    const filters = ['all', 'popular', 'offers', 'nearby', 'rated 4+'];
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
        <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>Search</h2>

        {!isOnline && (<div style={{
                backgroundColor: '#fff3e0',
                color: '#f57c00',
                padding: `${ui_1.DESIGN_TOKENS.spacing.xs}px ${ui_1.DESIGN_TOKENS.spacing.md}px`,
                borderRadius: ui_1.DESIGN_TOKENS.radius.md,
                marginBottom: ui_1.DESIGN_TOKENS.spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: ui_1.DESIGN_TOKENS.spacing.xs,
                fontSize: '14px'
            }}>
            <span>📵</span>
            <span>You're offline. Requests will be queued and sent when back online.</span>
          </div>)}

        <div style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>
        <input type="text" placeholder="Search restaurants, dishes..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.md, borderRadius: ui_1.DESIGN_TOKENS.radius.md, fontSize: '16px', border: '1px solid #ddd' }}/>
      </div>

      <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm, overflowX: 'auto', marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>
        {filters.map((f) => (<ui_1.Button key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} onClick={() => setActiveFilter(f)} variant={activeFilter === f ? 'primary' : 'secondary'}/>))}
      </div>

      {error ? (<div style={{ textAlign: 'center', padding: ui_1.DESIGN_TOKENS.spacing.lg }}>
          <p style={{ color: ui_1.DESIGN_TOKENS.colors.danger }}>{error}</p>
          {!isOnline && (<p style={{ color: ui_1.DESIGN_TOKENS.colors.textSecondary, fontSize: '14px', marginTop: ui_1.DESIGN_TOKENS.spacing.xs }}>
              You appear to be offline. Your request has been queued and will be sent when you're back online.
            </p>)}
          <ui_1.Button label="Retry" onClick={() => {
                retryFailedRequests();
            }} variant="outline"/>
        </div>) : restaurants.length === 0 ? (<div style={{ textAlign: 'center', padding: ui_1.DESIGN_TOKENS.spacing.lg }}>
          <p style={{ fontSize: '20px', marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>🔍</p>
          <p style={{ color: ui_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: ui_1.DESIGN_TOKENS.spacing.sm }}>No restaurants found</p>
          <p style={{ color: ui_1.DESIGN_TOKENS.colors.textSecondary, fontSize: '14px' }}>
            Try changing your search criteria or check your spelling.
          </p>
          <ui_1.Button label="Try Again" onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
            }} variant="outline"/>
        </div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.md }}>
          {loading ? (<ui_1.SkeletonCard count={3}/>) : (restaurants.map((r) => (<ui_1.Card key={r.id} title={r.name}>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>
                  {r.description} &middot; {r.deliveryTime} min &middot; {r.address}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.primary }}>
                    ⭐ {r.rating}
                  </div>
                  <ui_1.Button label="View Menu" onClick={() => router.push(`/restaurant?id=${r.id}`)}/>
                </div>
              </ui_1.Card>)))}
        </div>)}

      {/* Bottom nav */}
      <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
            borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        }}>
        {[
            { key: 'home', label: 'Home', icon: '🏠', path: '/' },
            { key: 'search', label: 'Search', icon: '🔍' },
            { key: 'orders', label: 'Orders', icon: '📦', path: '/history' },
            { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (<div key={tab.key} onClick={() => tab.path && router.push(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: tab.key === 'search' ? ui_1.DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}>
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>))}
      </nav>
    </div>);
};
exports.default = SearchPage;
