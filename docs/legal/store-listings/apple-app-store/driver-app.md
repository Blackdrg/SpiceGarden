# Apple App Store — SpiceGarden Driver

**App Name:** SpiceGarden Driver  
**Bundle ID:** com.spicegarden.driver  
**Status:** DRAFT — First draft, not yet submitted to App Store Connect.

---

## 1. App Name
SpiceGarden Driver

## 2. Subtitle
Deliver food. Earn money. On your schedule.

## 3. Promotional Text
Join thousands of delivery partners earning flexible income with SpiceGarden.

## 4. App Description
The SpiceGarden Driver app connects delivery partners with local restaurants and customers. Turn your time into income by delivering orders on your schedule.

**Key Features:**
- Accept delivery orders in your area with optimized routing
- Real-time GPS navigation with turn-by-turn directions
- Live order status updates and customer communication
- Track daily earnings and weekly payouts
- Flexible scheduling — work when you want
- Emergency SOS button for safety
- Performance bonuses and incentives
- Multi-order batching for efficiency
- Cash on delivery handling with secure cash management
- In-app support and training resources

**Privacy:** We collect location data only while you are on shift for dispatch, safety, and payout verification. Location data is automatically deleted after 30 days. Review our Privacy Policy and manage your preferences at any time.

**Backend references:**
- App config: `apps/delivery-partner/app.config.js:1-88`
- Bundle ID: `apps/delivery-partner/app.config.js:19` — `com.spicegarden.driver`
- Deep links: `apps/delivery-partner/app.config.js:67-86` — scheme `spicegarden-driver`
- Permissions: `apps/delivery-partner/app.config.js:24-28` — location, notifications
- Driver agreement: `docs/legal/terms/driver-agreement.md`

## 5. Keywords
food delivery, driver, courier, deliver food, earn money, gig work, delivery job, flexible schedule, side income, food courier, takeaway delivery

## 6. Support URL
https://partner.spicegarden.com/support

## 7. Marketing URL
https://www.spicegarden.com/partners

## 8. Privacy Policy URL
https://www.spicegarden.com/driver-privacy

## 9. Age Rating

| Rating | Reason |
|---|---|
| 4+ | No sensitive data categories — minimal data collection for delivery services |

**Data types used:**
- Contact Info: Phone number, name (for delivery)
- Location: GPS during active shifts (consent-gated by DPDP)
- Financial Info: Bank account for payouts, cash handling for COD
- Sensitive Data: Vehicle registration, driver's license (verified separately)

**Backend reference:** `apps/delivery-partner/src/screens/DriverLegalScreen.tsx:127` — DPDP Act consent statement.

## 10. Screenshots

| Device | Screenshot |
|---|---|
| iPhone 6.7" | `assets/screenshots/iphone-67-driver-home.png` |
| iPhone 6.7" | `assets/screenshots/iphone-67-driver-tracking.png` |
| iPhone 6.7" | `assets/screenshots/iphone-67-driver-earnings.png` |
| iPad | `assets/screenshots/ipad-driver-home.png` |

## 11. App Icon
`apps/delivery-partner/assets/icon.png`

## 12. Feature Graphic
`apps/delivery-partner/assets/splash.png`

## 13. Permissions Justifications

| Permission | Purpose | App Store Justification |
|---|---|---|
| Location | Receive nearby delivery orders and navigate | "SpiceGarden needs your location to receive nearby delivery orders and for live tracking." (`app.config.js:24-26`) |
| Notifications | New delivery order alerts | "SpiceGarden sends notifications for new delivery orders and status updates." (`app.config.js:28`) |

## 14. What's New (Version 1.0.0)
- Accept and manage delivery orders in your area
- Real-time GPS navigation and route optimization
- Track your earnings and weekly payouts
- Emergency SOS button for safety
- Performance bonuses and incentives

## 15. Category
Business

---

*This document is a DRAFT. For App Store submission, verify all metadata against current app store guidelines.*
