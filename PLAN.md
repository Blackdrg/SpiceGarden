# Enterprise-Level Implementation Plan: Customer Mobile & Delivery Partner Apps

## Priority Matrix

| Priority | Area | Customer Mobile | Delivery Partner | Impact | Effort |
|----------|------|-----------------|------------------|--------|--------|
| P0 | Navigation Flow | Missing OnboardingScreen integration, no route guards | No navigation structure, missing screens | Critical | Medium |
| P0 | Tracking Screen | Placeholder only | N/A | Critical | High |
| P1 | Loading States | Skeleton static, needs animation | Basic ActivityIndicator | High | Medium |
| P1 | Empty States | Partial implementation | Missing | High | Low |
| P1 | Visual Consistency | Uses DESIGN_TOKENS | Inline styles, no tokens | High | Medium |
| P2 | Retention UX | No favorites/saved addresses | No saved locations/patterns | Medium | High |
| P2 | Accessibility | Partial ARIA labels | Minimal | Medium | Medium |
| P2 | Performance | Some memoization | None | Medium | Medium |
| P3 | Error Handling | Basic network errors | Minimal | Low | Medium |

---

## Customer Mobile - File-by-File Implementation Tasks

### 1. App.tsx - Navigation Structure (P0)
**Current Issues:**
- OnboardingScreen exists but is not integrated into navigation flow
- Search tab incorrectly uses HomeScreen
- No route guards for authentication/onboarding state

**Tasks:**
- Add OnboardingScreen to stack navigator before Auth
- Create route guard to check onboarding status
- Add SearchScreen component to Search tab
- Integrate RestaurantScreen navigation properly

### 2. OnboardingScreen.tsx - Flow Enhancement (P0)
**Current Issues:**
- Uses inline backgroundColor in slides instead of DESIGN_TOKENS
- Icon rendering as strings instead of proper components
- Missing keyboard-avoiding behavior

**Tasks:**
- Replace inline colors with DESIGN_TOKENS.colors.*
- Fix Ionicons rendering (currently stringified)
- Add ScrollView for keyboard avoidance
- Add progress indicators with proper accessibility
- Add skip animation delay for better UX

### 3. TrackingScreen.tsx - Live Tracking Implementation (P0)
**Current Issues:**
- Complete placeholder - no actual tracking
- No map integration
- No real-time updates

**Tasks:**
- Implement live map with expo-location
- Add real-time driver position polling
- Create order status timeline component
- Add contact driver functionality
- Add ETA countdown animation
- Handle offline/permission states

### 4. SkeletonLoader.tsx → AnimatedSkeleton.tsx (P1)
**Current Issues:**
- Static view, no animation
- Web-only shimmer implementation in packages/ui
- No React Native animated skeleton

**Tasks:**
- Create AnimatedSkeleton component with shimmer animation
- Add pulse animation variant
- Create SkeletonRestaurantCard component
- Create SkeletonOrderItem component
- Replace all loading states with animated skeletons

### 5. CartScreen.tsx - Empty State & Loading (P1)
**Current Issues:**
- Uses ActivityIndicator instead of skeleton
- Empty cart state could be enhanced

**Tasks:**
- Replace ActivityIndicator with AnimatedSkeleton
- Add clear cart confirmation dialog
- Add cart item swipe-to-delete gesture
- Add quantity change animations

### 6. ProfileScreen.tsx - Saved Addresses & Favorites (P2)
**Current Issues:**
- Addresses navigates to non-existent screen
- Favorites not implemented
- No avatar upload

**Tasks:**
- Create AddressesScreen with CRUD operations
- Create FavoritesScreen for saved restaurants
- Add avatar upload with camera library
- Add edit profile validation improvements
- Add logout confirmation dialog

### 7. CheckoutScreen.tsx - Address Management (P2)
**Current Issues:**
- Uses placeholder character for back button
- No address selector
- Missing form validation

**Tasks:**
- Fix back button icon (should be ←)
- Add saved addresses selection modal
- Add form validation with proper error messages
- Add order placement animation
- Add payment method validation

### 8. SearchScreen.tsx - Recent & Filters (P1)
**Current Issues:**
- Recent searches not persisted properly
- Filters UI exists but not functional
- No search suggestions

**Tasks:**
- Add trending searches from backend
- Implement filter functionality
- Add search result caching with TTL
- Add clear individual recent search
- Add pull-to-refresh for results

### 9. HistoryScreen.tsx - Pagination & Refresh (P1)
**Current Issues:**
- No infinite scroll
- No order details navigation

**Tasks:**
- Implement infinite scroll with loadMore
- Add order details navigation
- Add reorder confirmation
- Add order cancellation flow with reason selection

### 10. RestaurantScreen.tsx - Menu & Cart (P1)
**Current Issues:**
- Add to cart doesn't persist
- No menu categories
- No cart badge

**Tasks:**
- Implement add to cart with persistence
- Add menu category tabs
- Add cart item count badge
- Add item customization modal
- Add favorite restaurant toggle

---

## Delivery Partner - File-by-File Implementation Tasks

### 1. App.tsx Refactoring - Navigation & Structure (P0)
**Current Issues:**
- All screens inline in App.tsx
- No DESIGN_TOKENS usage
- Hardcoded colors
- No navigation structure

**Tasks:**
- Extract screens to separate files
- Create DeliveriesScreen component
- Create HomeScreen with active orders
- Create EarningsScreen with earnings history
- Create ProfileScreen with driver details
- Use DESIGN_TOKENS for all styling

### 2. DeliveriesScreen.tsx - Order Management (P0)
**Current Issues:**
- Missing entirely (placeholder HomeScreen)
- No order list
- No acceptance flow

**Tasks:**
- Create order list with cards
- Add order acceptance timer
- Add order rejection functionality
- Add map preview for pickup/delivery
- Add status update buttons
- Add earnings per order display

### 3. HomeScreen.tsx - Active Orders & Map (P1)
**Current Issues:**
- Just placeholder text
- No map integration
- No online/offline toggle

**Tasks:**
- Integrate expo-location for map view
- Add online/offline toggle switch
- Show active order count
- Display today's earnings summary
- Add shift start/end functionality
- Add navigation to current order

### 4. EarningsScreen.tsx - Analytics (P1)
**Current Issues:**
- Just placeholder text
- No data visualization

**Tasks:**
- Create earnings chart (bar chart for daily)
- Add weekly/monthly breakdown
- Show tip statistics
- Add payout request functionality
- Add transaction history list
- Add performance metrics

### 5. ProfileScreen.tsx - Driver Settings (P1)
**Current Issues:**
- Missing - uses placeholder
- No vehicle verification

**Tasks:**
- Create driver profile display
- Add vehicle document upload
- Add bank account for payouts
- Add notification preferences
- Add rating display
- Add support contact

### 6. OnboardingScreen.tsx - Multi-step Flow (P0)
**Current Issues:**
- Inline in App.tsx
- No validation
- No document upload

**Tasks:**
- Extract to separate file
- Add document upload (license, vehicle)
- Add phone verification
- Add background check status
- Add terms acceptance
- Add smooth transitions between steps

### 7. LoginScreen.tsx - Authentication (P0)
**Current Issues:**
- Inline in App.tsx
- Basic error handling
- No biometric login

**Tasks:**
- Extract to separate file
- Add biometric authentication
- Add "remember me" toggle
- Add forgot password flow
- Add proper error states
- Add loading state with animation

---

## Shared Components to Create

### UI Package Extensions (`packages/ui/`)

```
src/
├── components/
│   ├── AnimatedSkeleton.tsx   # Shimmer animation for RN
│   ├── ErrorState.tsx          # Standard error UI
│   ├── EmptyState.tsx          # Standard empty state UI
│   ├── SuccessState.tsx        # Success confirmation UI
│   ├── NetworkBanner.tsx       # Offline indicator
│   └── ToastProvider.tsx       # Toast notifications
├── hooks/
│   ├── useNetworkStatus.ts     # Network connectivity hook
│   ├── useReducedMotion.ts     # Accessibility hook
│   └── useKeyboardAvoiding.ts  # Keyboard handling hook
└── utils/
    ├── accessibility.ts        # ARIA helpers
    └── performance.ts          # Memoization utilities
```

### Customer Mobile Shared
```
src/
├── components/
│   ├── RestaurantCardSkeleton.tsx
│   ├── OrderCardSkeleton.tsx
│   ├── AddressSelector.tsx
│   ├── PaymentMethodSelector.tsx
│   └── OrderTimeline.tsx       # For tracking screen
├── hooks/
│   ├── useFavorites.ts
│   ├── useAddresses.ts
│   └── useCart.ts
├── screens/
│   ├── AddressesScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── WalletScreen.tsx
│   ├── NotificationsScreen.tsx
│   └── SupportScreen.tsx
```

### Delivery Partner Shared
```
src/
├── components/
│   ├── OrderCard.tsx
│   ├── EarningsChart.tsx
│   ├── DeliveryMap.tsx
│   └── StatusTimeline.tsx
├── hooks/
│   ├── useActiveOrders.ts
│   ├── useLocationTracking.ts
│   └── useEarnings.ts
├── screens/
│   ├── OrderDetailsScreen.tsx
│   ├── ShiftHistoryScreen.tsx
│   └── PerformanceScreen.tsx
```

---

## Dependencies & Integration Points

### Customer Mobile

| Component | Dependencies | Backend Endpoints |
|-----------|-------------|-------------------|
| TrackingScreen | expo-location, react-native-maps | GET /orders/:id/tracking, WS /orders/:id/ws |
| AddressesScreen | No new | GET/POST/PUT/DELETE /addresses |
| FavoritesScreen | No new | GET/POST /favorites |
| SearchScreen | No new | GET /search?q=, GET /search/trending |
| CartScreen | expo-haptics (exists) | N/A (local storage) |
| CheckoutScreen | No new | POST /orders, GET /payment-methods |

### Delivery Partner

| Component | Dependencies | Backend Endpoints |
|-----------|-------------|-------------------|
| DeliveriesScreen | expo-location | GET /driver/orders, PUT /driver/orders/:id |
| HomeScreen | expo-location | PATCH /driver/status, GET /driver/stats |
| EarningsScreen | No new | GET /driver/earnings, POST /driver/payouts |
| OnboardingScreen | expo-document-picker | POST /driver/register, POST /driver/documents |
| LoginScreen | expo-local-authentication | POST /auth/driver-login |

---

## Testing Strategy

### Unit Tests
- **Location**: `__tests__/unit/`
- **Framework**: Jest (already configured)
- **Coverage**: 
  - Validation utilities
  - Service functions (order.service.ts)
  - Hooks (useOrderHistory, useDriverProfile)
  - Component rendering with props

### Integration Tests
- **Location**: `__tests__/integration/`
- **Focus**: Storage integration, API calls with retry
- **Coverage**:
  - AsyncStorage operations
  - API service error handling
  - Cart persistence
  - Profile save/load

### E2E Tests (Detox)
- **Location**: `__tests__/e2e/`
- **Scenarios**:

**Customer Mobile:**
1. Onboarding flow completion
2. Authentication (login/register)
3. Restaurant browsing and search
4. Add to cart and checkout flow
5. Order tracking with real-time updates
6. Profile editing and saved addresses
7. Network error recovery

**Delivery Partner:**
1. Login with biometrics
2. Order acceptance flow
3. Status updates (accept → pickup → deliver)
4. Earnings calculation
5. Shift management
6. Offline mode handling

### Accessibility Testing
- Use `react-native-testing-library` with `accessibility` queries
- Test screen reader announcements
- Test keyboard navigation
- Test reduced motion preference

### Performance Testing
- Track render times with `react-test-renderer`
- Verify memoization prevents unnecessary renders
- Test large list performance (FlatList optimization)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Navigation flow fixes
- Tracking screen implementation
- Animated skeleton components
- Design token standardization

### Phase 2: Core Features (Week 2)
- Addresses and favorites
- Order management for delivery partner
- E2E test coverage
- Accessibility improvements

### Phase 3: Polish (Week 3)
- Loading animations
- Error states enhancement
- Performance optimization
- Offline handling

### Phase 4: Testing & Validation (Week 4)
- Full test suite implementation
- Performance benchmarking
- Accessibility audit
- Bug fixes and polish

---

## File Creation Summary

### To Create - Customer Mobile (12 files)
1. `src/screens/AddressesScreen.tsx`
2. `src/screens/FavoritesScreen.tsx`
3. `src/screens/WalletScreen.tsx`
4. `src/screens/NotificationsScreen.tsx`
5. `src/screens/SupportScreen.tsx`
6. `src/components/RestaurantCardSkeleton.tsx`
7. `src/components/OrderCardSkeleton.tsx`
8. `src/components/AddressSelector.tsx`
9. `src/components/PaymentMethodSelector.tsx`
10. `src/components/OrderTimeline.tsx`
11. `src/hooks/useFavorites.ts`
12. `src/hooks/useAddresses.ts`

### To Create - Delivery Partner (6 files)
1. `src/screens/DeliveriesScreen.tsx`
2. `src/screens/OrderDetailsScreen.tsx`
3. `src/screens/ShiftHistoryScreen.tsx`
4. `src/screens/PerformanceScreen.tsx`
5. `src/components/OrderCard.tsx`
6. `src/hooks/useActiveOrders.ts`

### To Modify - Customer Mobile (8 files)
1. `App.tsx` - Navigation structure
2. `OnboardingScreen.tsx` - Accessibility and tokens
3. `TrackingScreen.tsx` - Full implementation
4. `SkeletonLoader.tsx` - Animation
5. `CartScreen.tsx` - Loading state
6. `ProfileScreen.tsx` - Favorites integration
7. `CheckoutScreen.tsx` - Address selection
8. `SearchScreen.tsx` - Filter persistence

### To Modify - Delivery Partner (2 files)
1. `App.tsx` - Extract screens, use tokens
2. All screens - Extract from inline

---

## Success Metrics

- **Performance**: 60fps on interactions, <300ms render for lists
- **Accessibility**: WCAG 2.1 AA compliance, screen reader tested
- **Reliability**: >99% offline recovery, proper error boundaries
- **UX**: Smooth transitions, haptic feedback on all actions
- **Test Coverage**: >80% unit, >70% integration, all E2E scenarios