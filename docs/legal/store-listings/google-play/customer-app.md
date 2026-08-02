# Google Play Store — SpiceGarden Customer

**App Name:** SpiceGarden: Food Delivery  
**Package Name:** com.spicegarden.customer  
**Status:** DRAFT — First draft, not yet submitted to Google Play Console.

---

## 1. App Title
SpiceGarden: Food Delivery

## 2. Short Description
Order food from local restaurants. Fast delivery. Real-time tracking.

## 3. Full Description
SpiceGarden is a food delivery platform connecting customers with their favorite local restaurants. Browse menus, place orders, and track delivery in real time with live GPS tracking.

**Key Features:**
- Browse thousands of restaurants with real-time menu updates
- Place orders with a single tap — saved payment methods and addresses
- Real-time order tracking with live delivery partner location on the map
- Multiple payment options: credit/debit cards, UPI, net banking, wallet, and cash on delivery
- Personalized recommendations based on your order history
- Exclusive offers and discounts for app users
- Contactless delivery option for every order
- Schedule orders up to 30 days in advance
- Reorder favorites with one tap
- Customer support through in-app chat

**Privacy:** We collect only the data necessary to operate the service. Review our full Privacy Policy and manage your data preferences at any time.

**App details (from app.config.js):**
- Package: `com.spicegarden.customer`
- Version: 1.0.0
- Runtime version: 1.0.0 (Android)
- SDK: Expo (Managed workflow)

**Backend references:**
- App config: `apps/customer-mobile/app.config.js:1-110`
- Deep links: `spicegarden://` (pay) and `spicegarden-cash://` (cod) with intent filters (`app.config.js:88-101`)
- Universal links: `https://spicegarden.com/link` (`app.config.js:105`)

## 4. Content Rating
**Questionnaire Answers (Google Play Console):**

| Question | Answer |
|---|---|
| Do you have ads in your app? | No |
| Are there gambling or games of chance? | No |
| Do you have in-app purchases? | Yes (SpiceGarden Wallet credits) |
| Is there cartoon violence? | No |
| Is there realistic violence? | No |
| Is there mature or suggestive content? | No |
| Are there sexual or explicit content? | No |
| Is there profanity or crude humor? | No |
| Is there drug, tobacco, or alcohol use? | No |
| Is there weapons or weaponry? | No |
| Is there sexual content? | No |

**Expected Rating:** Everyone 10+ (due to in-app purchases)

## 5. Privacy Policy
https://www.spicegarden.com/privacy-policy

## 6. Categories
Primary: Food & Drink  
Secondary: Shopping

## 7. Graphic Assets

| Asset Type | File Path |
|---|---|
| High-res icon (512x512) | `assets/icon.png` |
| Feature graphic (1024x500) | `assets/splash.png` |
| Promotional screenshot 1 | `assets/screenshots/play-customer-home.png` |
| Promotional screenshot 2 | `assets/screenshots/play-customer-tracking.png` |
| Promotional screenshot 3 | `assets/screenshots/play-customer-checkout.png` |
| Promotional screenshot 4 | `assets/screenshots/play-customer-orders.png` |
| Promotional screenshot 5 | `assets/screenshots/play-customer-profile.png` |

## 8. Permissions and Justifications

| Permission | Purpose | Google Play Justification |
|---|---|---|
| `ACCESS_FINE_LOCATION` | Show nearby restaurants and track delivery | Required for food delivery geolocation |
| `ACCESS_COARSE_LOCATION` | Show nearby restaurants | Required for food delivery geolocation |
| `CAMERA` | Scan QR codes for payments | Required for QR code payment scanning |
| `READ_EXTERNAL_STORAGE` | Upload payment receipts | Required for receipt upload |
| `WRITE_EXTERNAL_STORAGE` | Cache map tiles and images | Required for offline map caching |
| `POST_NOTIFICATIONS` | Order updates and delivery tracking | Required for order status notifications |
| `INTERNET` | Connect to SpiceGarden servers | Required for all app functionality |
| `SYSTEM_ALERT_WINDOW` | Display overlay for navigation | Required for picture-in-picture navigation |
| `VIBRATE` | Haptic feedback for order updates | Required for order status haptics |
| `RECEIVE_BOOT_COMPLETED` | Restore delivery tracking on reboot | Required to maintain tracking after device restart |

**Backend reference:** `apps/customer-mobile/app.config.js:50-61`

## 9. What's New
- Initial release of the SpiceGarden customer app
- Browse thousands of restaurants
- Real-time order tracking
- Multiple payment options including COD, UPI, cards, and wallet

## 10. Tags
food delivery, restaurants, food, delivery, order online, takeaway, uber eats, zomato, swiggy

## 11. Contact Information
- Customer support: https://help.spicegarden.com
- Email: support@spicegarden.com
- Phone: +91-0000000000

## 12. Ads and Monetization
This app contains no advertisements. It is a free-to-use food delivery platform.

## 13. Target API Level
Target API: Android 14 (API 34)  
Minimum API: Android 7.0 (API 24)

**Android config:** `apps/customer-mobile/app.config.js:44-62`

## 14. Data Safety (Google Play Required)

| Data Type | Collected | Purpose | Shared with Third Parties |
|---|---|---|---|
| Name | Yes | Account identification | No |
| Email | Yes | Account access, order updates | No |
| Phone number | Yes | Delivery coordination | With restaurants for order fulfillment |
| Location | Yes (during active orders) | Delivery routing, live tracking | With delivery partners for order fulfillment |
| Payment info | Yes (tokenized) | Transaction processing | With Stripe/Razorpay (tokenized) |
| Device info | Yes | Crash reporting (consent-gated), analytics | No (Sentry only for crash reporting) |

**Backend references:**
- Payment processing: `apps/backend/src/services/payments/` — tokenized via Stripe/Razorpay
- Analytics consent: `packages/ui/analytics.ts:14-23` and `apps/customer-web/src/analytics.ts:4-12` — consent-gated
- Sentry: `apps/customer-mobile/App.tsx:28-32` — crash reporting with consent-gated performance monitoring

---

*This document is a DRAFT. For Google Play submission, verify all metadata and safety labels against current Google Play policies.*
