# Component Inventory

## Overview

SpiceGarden ships with a comprehensive shared component library (`@spicegarden/ui`) containing 20+ React components, 19 domain-specific icons, and a complete design token system. All components are shared across the web frontends.

## Design Tokens

**File:** `packages/ui/tokens.ts`

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#FF5A1F` | Primary actions, brand |
| `secondary` | `#111827` | Text, dark surfaces |
| `background` | `#F9FAFB` | Page background |
| `surface` | `#FFFFFF` | Card backgrounds |
| `elevated` | `#F5F5F5` | Elevated surfaces |
| `textPrimary` | (from secondary) | Primary text |
| `textSecondary` | (muted) | Secondary text |
| `textInverse` | (on primary) | Text on primary bg |
| `success` | `#10B981` | Success states |
| `danger` | `#EF4444` | Error/destructive |
| `warning` | `#F59E0B` | Warning states |
| `premium` | `#D4AF37` | Premium features |
| `border` | `#E5E7EB` | Borders |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `4px` | Tight spacing |
| `sm` | `8px` | Compact spacing |
| `md` | `16px` | Standard spacing |
| `lg` | `24px` | Section spacing |
| `xl` | `32px` | Large spacing |
| `xxl` | `48px` | Page-level spacing |

### Typography

| Token | Font | Weight | Usage |
|-------|------|--------|-------|
| `headingXL` | Inter | 600/700 | Page titles |
| `headingM` | Inter | 600/700 | Section headings |
| `body` | Inter | 400 | Body text |
| `bodyMedium` | Inter | 500 | Emphasized body |
| `caption` | Inter | 400 | Small text |
| `smallLabel` | Inter | 500 | Micro labels |

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `4px` | Small elements |
| `md` | `8px` | Standard radius |
| `button` | `12px` | Buttons |
| `input` | `14px` | Input fields |
| `card` | `24px` | Cards |
| `container` | `28px` | Major containers |
| `full` | `9999px` | Pills, circles |

### Motion

| Token | Duration | Usage |
|-------|----------|-------|
| `micro` | `150ms` | Button hover, small state changes |
| `standard` | `300ms` | Standard transitions |
| `page` | `450ms` | Page transitions |

### Shadows

| Token | Usage |
|-------|-------|
| `small` | Elevated elements |
| `medium` | Modals, dropdowns |
| `large` | Floating elements |
| `premiumFloat` | Premium feature highlights |

## Components

### Button

**File:** `packages/ui/Button.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `primary` \| `secondary` \| `ghost` \| `destructive` \| `loading` \| `outline` | `primary` | Visual style |
| `size` | `sm` \| `md` \| `lg` | `md` | Button size |
| `isLoading` | `boolean` | `false` | Loading state with spinner |
| `disabled` | `boolean` | `false` | Disabled state |
| `onClick` | `() => void` | — | Click handler |
| `children` | `ReactNode` | — | Button content |

**Variants:**
- `primary` - Brand color background
- `secondary` - Outlined style
- `ghost` - Text-only, no background
- `destructive` - Red/danger styling
- `loading` - With loading indicator
- `outline` - Border-only style

### Card

**File:** `packages/ui/Card.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `default` \| `elevated` \| `list` | `default` | Card style |
| `title` | `string` | — | Card title |
| `children` | `ReactNode` | — | Card content |

**Variants:**
- `default` - Standard card
- `elevated` - Shadow-elevated
- `list` - List item style

### Input

**File:** `packages/ui/Input.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Input label |
| `error` | `string` | — | Error message |
| `helperText` | `string` | — | Helper text |
| `disabled` | `boolean` | `false` | Disabled state |
| `forwardRef` | `boolean` | `true` | Forward ref to underlying input |

### Dropdown

**File:** `packages/ui/Dropdown.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<{value, label}>` | [] | Dropdown options |
| `value` | `string` | — | Selected value |
| `onChange` | `(value) => void` | — | Selection handler |
| `placeholder` | `string` | — | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |

### Modal

**File:** `packages/ui/Modal.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Open/close state |
| `onClose` | `() => void` | — | Close handler |
| `title` | `string` | — | Modal title |
| `children` | `ReactNode` | — | Modal content |
| `footer` | `ReactNode` | — | Footer actions |

**Features:**
- Body scroll lock
- Fade-in/slide-up animation
- Overlay click dismiss
- Accessible (FocusTrap)

### BottomSheet

**File:** `packages/ui/Modal.tsx` (variant)

Mobile-first modal variant. Slides up from bottom on mobile.

### Toast

**File:** `packages/ui/Toast.tsx`

**Context-based system:**
- `ToastProvider` - Top-level provider
- `useToast()` - Hook for toast actions
- `InlineAlert` - Inline variant

| Type | Description |
|------|-------------|
| `success` | Green, checkmark icon |
| `error` | Red, error icon |
| `info` | Blue, info icon |

| Prop | Type | Description |
|------|------|-------------|
| `message` | `string` | Toast message |
| `type` | `success` \| `error` \| `info` | Toast type |
| `duration` | `number` | Auto-dismiss time (ms) |
| `action` | `{label, onClick}` | Optional action button |

### Stepper

**File:** `packages/ui/Stepper.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value |
| `onChange` | `(value) => void` | — | Change handler |
| `min` | `number` | 0 | Minimum value |
| `max` | `number` | — | Maximum value |
| `step` | `number` | 1 | Step increment |

### OTPInput

**File:** `packages/ui/OTPInput.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `4` \| `6` | `6` | OTP length |
| `onComplete` | `(code: string) => void` | — | Completion callback |
| `autoFocus` | `boolean` | `true` | Auto-focus first input |
| `disabled` | `boolean` | `false` | Disabled state |

**Features:**
- Auto-advance on input
- Paste support
- Keyboard navigation (backspace, arrow keys)
- Obfuscated input

### SearchInput

**File:** `packages/ui/SearchInput.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearch` | `(query: string) => void` | — | Search callback |
| `placeholder` | `string` | — | Placeholder |
| `debounceMs` | `number` | 300 | Debounce delay |

### Skeleton

**File:** `packages/ui/Skeleton.tsx`

| Variant | Usage |
|---------|-------|
| `text` | Paragraph placeholder |
| `circular` | AvatarPlaceholder |
| `rectangular` | Image/video placeholder |

**Helper Components:**
- `SkeletonCard` - Card skeleton
- `SkeletonList` - List skeleton

### SkeletonTemplates

**File:** `packages/ui/SkeletonTemplates.tsx`

| Template | Purpose |
|----------|---------|
| `ProductListSkeleton` | Product grid loading |
| `MenuListSkeleton` | Menu items loading |
| `CheckoutSkeleton` | Checkout page loading |
| `TrackingSkeleton` | Order tracking loading |
| `TimelineTrackingSkeleton` | Timeline view loading |

### LoadingStates

**File:** `packages/ui/LoadingStates.tsx`

| Component | Usage |
|-----------|-------|
| `EmptyState` | No data available state |
| `NetworkError` | Network failure state |
| `LoadingState` | Generic loading (card/list/text variants) |

### LottieSuccessAnimation

**File:** `packages/ui/LottieSuccessAnimation.tsx`

- SVG-based success animation (no Lottie runtime dependency)
- Inline SVG with checkmark
- Triggered on successful actions

### FlowManager

**File:** `packages/ui/FlowManager.tsx`

Multi-step form wizard with:
- Progress indicators
- Step navigation (prev/next)
- Success/error states
- Analytics event tracking per step

### ErrorBoundary

**File:** `packages/ui/ErrorBoundary.tsx`

- Class-based boundary
- Fallback UI with retry button
- Error logging

### Domain Cards

**File:** `packages/ui/Cards.tsx`

| Card | Purpose |
|------|---------|
| `FoodCard` | Dish display (veg/non-veg, spice level, rating) |
| `MenuCard` | Menu item (section/item/combo variants) |
| `MapCard` | Delivery ETA/progress |
| `TrackingCard` | Delivery status with contact/support |
| `ReviewCard` | Star rating + review text |

## Icon System

**Location:** `packages/ui/icons/`

### Icon Categories

**System (3 icons):**
- `RatingIcon` (Star) - Rating display
- `NotificationIcon` (Bell) - Notifications
- `LocationIcon` (MapPin) - Location

**Navigation (3 icons):**
- `HomeIcon` (Home) - Home navigation
- `SearchIcon` (Search) - Search
- `ProfileIcon` (User) - Profile

**Kitchen (2 icons):**
- `KitchenIcon` (ChefHat) - Kitchen display
- `FireIcon` (Flame) - Hot/spicy indicator

**Delivery (1 icon):**
- `DeliveryIcon` (Bike/Truck) - Delivery status

**Commerce (8 icons):**
- `WalletIcon` - Wallet
- `PaymentIcon` (CreditCard) - Payment
- `OrderIcon` (Package) - Orders
- `CartIcon` (ShoppingCart) - Cart
- `BurgerIcon` - Burgers
- `PizzaIcon` - Pizzas
- `DrinkIcon` - Beverages
- `DessertIcon` - Desserts
- `HealthyIcon` - Healthy food

**Admin (3 icons):**
- `DashboardIcon` (BarChart3) - Dashboard
- `UsersIcon` (Users) - Users management
- `ShieldIcon` (ShieldAlert) - Security

### Icon Pattern

All icons:
- Wrap `lucide-react` icons
- Extend `IconProps` (size, color, strokeWidth, ...SVGProps)
- Default to `DESIGN_TOKENS.colors.primary`
- Type-safe via custom `lucide-react.d.ts` declaration

### Icon CSS

**File:** `packages/ui/icons.css`

CSS custom properties:
```css
--icon-size-xs: 12px;
--icon-size-sm: 16px;
--icon-size-md: 20px;
--icon-size-lg: 24px;
--icon-size-xl: 32px;
--icon-size-2xl: 48px;
--icon-color-primary: #FF5A1F;
```

## Analytics

**File:** `packages/ui/analytics.ts`

### Exported Functions

| Function | Purpose |
|----------|---------|
| `trackEvent(event, properties?)` | Track analytics event |
| `useAnalytics()` | React hook for analytics |
| `useWebVitals()` | Web Vitals tracking (LCP, FID, CLS) |

### Event Types

| Event | Trigger |
|-------|---------|
| `page_view` | Route change |
| `click` | Button click |
| `order_placed` | Order placed |
| `payment_success` | Payment successful |
| `payment_failed` | Payment failed |
| `search` | Search performed |
| `add_to_cart` | Item added to cart |
| `web_vital` | Web vitals metrics |
| `flow_started` | Flow begun |
| `flow_step_completed` | Flow step done |
| `flow_completed` | Flow finished |
| `flow_error` | Flow error |

## Custom Hooks

### useFlow

**File:** `packages/ui/useFlow.ts`

Multi-step flow state management:
- State: `idle` | `in_progress` | `success` | `error`
- Analytics tracking per step
- Step transition callbacks

### useReducedMotion

**File:** `packages/ui/tokens.ts`

```typescript
const ReducedMotionContext = createContext(false);
function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}
```

Respects `prefers-reduced-motion` media query.

## Testing Patterns

### Component Tests

| Component | Test File | Approach |
|-----------|-----------|----------|
| Button | `Button.test.tsx` | @testing-library/react: render, click, aria assertions |
| Button | `ButtonRegression.test.tsx` | Variant-specific regression |
| Input | `Input.test.tsx` | Label, error state rendering |
| FlowManager | `FlowManager.test.js` | Step navigation |
| useFlow | `useFlow.test.tsx` | renderHook + act pattern |
| LottieSuccessAnimation | `LottieSuccessAnimation.test.js` | Render + SVG assertions |
| Skeleton | `Skeleton.test.js` | Variant rendering |
| LoadingStates | `LoadingStates.test.tsx` | Custom stub components |

### Mock Strategy

- `__mocks__/styleMock.js` - Empty module for CSS imports
- `jest.mock('../analytics', ...)` - Mock analytics module
- Stub components for LoadingStates tests

## Usage Across Apps

| App | Components Used |
|-----|-----------------|
| `customer-web` | Button, Card, Input, Skeleton, SkeletonCard, DESIGN_TOKENS, trackEvent |
| `restaurant-dashboard` | Button, DESIGN_TOKENS |
| `super-admin` | DESIGN_TOKENS |
| `customer-mobile` | DESIGN_TOKENS (imports only, builds own wrappers) |
| `delivery-partner` | DESIGN_TOKENS |

Note: Only `customer-web` uses full component library. Other apps use `DESIGN_TOKENS` for consistent styling.
