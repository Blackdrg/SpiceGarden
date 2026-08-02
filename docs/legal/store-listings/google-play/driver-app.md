# Google Play Store — SpiceGarden Driver

**App Name:** SpiceGarden Driver  
**Package Name:** com.spicegarden.driver  
**Status:** DRAFT — First draft, not yet submitted to Google Play Console.

---

## 1. App Title
SpiceGarden Driver

## 2. Short Description
Deliver food. Earn money. On your schedule.

## 3. Full Description
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

**App details (from app.config.js):**
- Package: `com.spicegarden.driver`
- Version: 1.0.0
- SDK: Expo (Managed workflow)
- Deep link scheme: `spicegarden-driver://`

**Backend references:**
- App config: `apps/delivery-partner/app.config.js:1-88`
- Deep links: `apps/delivery-partner/app.config.js:67-86` — scheme `spicegarden-driver`
- Universal links: `https://spicegarden.com/driver-link` (`app.config.js:83`)
- DPDP consent: `apps/delivery-partner/src/screens/DriverLegalScreen.tsx:127` — "Location tracking is used only while you are on active deliveries and requires your consent."

## 4. Content Rating
**Questionnaire Answers (Google Play Console):**

| Question | Answer |
|---|---|
| Do you have ads in your app? | No |
| Are there gambling or games of chance? | No |
| Do you have in-app purchases? | No |
| Is there cartoon violence? | No |
| Is there realistic violence? | No |
| Is there mature or suggestive content? | No |
| Are there sexual or explicit content? | No |
| Is there profanity or crude humor? | No |
| Is there drug, tobacco, or alcohol use? | No |
| Is there weapons or weaponry? | No |
| Is there sexual content? | No |

**Expected Rating:** Everyone

## 5. Privacy Policy
https://www.spicegarden.com/driver-privacy

## 6. Categories
Primary: Business

## 7. Graphic Assets

| Asset Type | File Path |
|---|---|
| High-res icon (512x512) | `assets/icon.png` |
| Feature graphic (1024x500) | `assets/splash.png` |
| Promotional screenshot 1 | `assets/screenshots/play-driver-home.png` |
| Promotional screenshot 2 | `assets/screenshots/play-driver-tracking.png` |
| Promotional screenshot 3 | `assets/screenshots/play-driver-earnings.png` |
| Promotional screenshot 4 | `assets/screenshots/play-driver-orders.png` |
| Promotional screenshot 5 | `assets/screenshots/play-driver-profile.png` |

## 8. Permissions and Justifications

| Permission | Purpose | Google Play Justification |
|---|---|---|
| `ACCESS_FINE_LOCATION` | Receive nearby delivery orders and navigate | Required for real-time delivery dispatch and routing |
| `ACCESS_COARSE_LOCATION` | Receive nearby delivery orders | Required for delivery dispatch |
| `POST_NOTIFICATIONS` | New delivery order alerts and status updates | Required for delivery order notifications |
| `INTERNET` | Connect to SpiceGarden servers | Required for all app functionality |
| `VIBRATE` | Haptic feedback for order alerts | Required for delivery order notifications |
| `RECEIVE_BOOT_COMPLETED` | Restore delivery session on reboot | Required to maintain active shift state |

**Backend reference:** No explicit Android permissions list in `app.config.js` (delivery-partner config does not specify `android.permissions` — inherited from Expo defaults).

## 9. What's New
- Initial release of the SpiceGarden Driver app
- Accept and manage delivery orders
- Real-time GPS navigation
- Track earnings and weekly payouts

## 10. Tags
food delivery, driver, courier, earn money, gig work, delivery job, food courier, takeaway, delivery app

## 11. Contact Information
- Partner support: https://partner.spicegarden.com/support
- Email: driver-support@spicegarden.com
- Phone: +91-0000000000

## 12. Ads and Monetization
This app contains no advertisements.

## 13. Target API Level
Target API: Android 14 (API 34)  
Minimum API: Android 7.0 (API 24)

**Android config:** `apps/delivery-partner/app.config.js:37-43`

## 14. Data Safety (Google Play Required)

| Data Type | Collected | Purpose | Shared with Third Parties |
|---|---|---|---|
| Phone number | Yes | Account identification, customer communication | With customers for delivery coordination |
| Location | Yes (during active shifts only) | Dispatch, navigation, safety, payout verification | With customers for live tracking during delivery |
| Device info | Yes | Crash reporting, app analytics | No |
| Financial info | No (bank details stored encrypted) | Payout processing | With payment processors for settlement only |
| Vehicle info | Yes (license plate, type) | Order verification, safety | With customers for identification |

**Backend references:**
- Location retention: `apps/backend/src/legal/retention.service.ts:25` — driver GPS data retained for 30 days
- Data deletion: `apps/backend/src/legal/data-subject-request.service.ts:204-282` — automated GDPR/DPDP deletion
- Sentry: `apps/delivery-partner/App.tsx:5-9` — crash reporting with consent-gated performance monitoring (tracesSampleRate: 0 by default)

---

*This document is a DRAFT. For Google Play submission, verify all metadata and safety labels against current Google Play policies.*
