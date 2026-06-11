# Phase 1 - Complete Figma UX Architecture

This directory contains the complete UX specification for SpiceGarden's Phase 1 design system.

## Structure

| File | Description |
|------|-------------|
| `00_overview.md` | UX philosophy + enterprise rules |
| `01_figma_workspace_structure.md` | Figma project workspace folders |
| `02_design_system.md` | Design tokens (colors, typography, spacing, shadows) |
| `03_motion_design_system.md` | Motion principles + timing + recipes |
| `04_customer_journey.md` | Customer journey flows (first-time, reorder, etc.) |
| `05_customer_app_information_architecture.md` | Bottom nav + routing rules |
| `06_customer_app_screen_architecture.md` | 100-150 screen taxonomy |
| `07_delivery_partner_screen_architecture.md` | Delivery partner screens (40+) |
| `08_restaurant_dashboard_screen_architecture.md` | Kitchen-first workflow |
| `09_admin_panel_screen_architecture.md` | Admin dashboard + analytics |
| `10_landing_pages.md` | Landing page specs |
| `11_component_library_spec.md` | 10+ UI component variants |
| `12_developer_handoff_checklist.md` | Pixel-perfect handoff guide |

## Implementation Status

All components are implemented in `packages/ui`:

### Inputs
- [x] Button (primary/secondary/ghost/destructive/loading)
- [x] Card (default/elevated/list/skeleton variants)
- [x] Input (text with validation + accessibility)
- [x] SearchInput (with search icon)
- [x] OTPInput (4/6 digit with paste support)
- [x] Dropdown (single-select)
- [x] Stepper (quantity selector)

### Cards
- [x] FoodCard (with veg/non-veg, spice level, rating, offer badge)
- [x] MenuCard (section/item/combo variants)
- [x] MapCard (with ETA and progress)
- [x] TrackingCard (order status tracking)
- [x] ReviewCard (rating + review input)

### Overlays
- [x] Modal (confirmation modal)
- [x] BottomSheet (filters, address picker)

### Skeletons
- [x] Skeleton (generic text/circular/rectangular)
- [x] SkeletonCard
- [x] SkeletonList
- [x] ProductListSkeleton
- [x] MenuListSkeleton
- [x] CheckoutSkeleton
- [x] TrackingSkeleton
- [x] TimelineTrackingSkeleton

### Notifications
- [x] Toast (success/error/info with ToastProvider)
- [x] InlineAlert

## Design Tokens

All components consume `DESIGN_TOKENS` from `packages/ui/tokens.ts`:
- Colors: primary (#FF5A1F), semantic tokens for light/dark mode
- Typography: Inter/Poppins/Roboto Mono with hierarchy
- Spacing: 8px grid system
- Radii: button(12), input(14), card(24), container(28)
- Motion: micro(150ms), standard(300ms), page(450ms)
- Shadows: small/medium/large/premiumFloat

## Storybook

Stories are available in `.storybook/` and can be run with:
```bash
npm run storybook
```