# Apple App Store — SpiceGarden Customer

**App Name:** SpiceGarden Customer  
**Bundle ID:** com.spicegarden.customer  
**Status:** DRAFT — First draft, not yet submitted to App Store Connect.

---

## 1. App Name
SpiceGarden: Food Delivery

## 2. Subtitle
Order food from local restaurants. Fast delivery.

## 3. Promotional Text
Discover thousands of restaurants and get meals delivered to your door in minutes.

## 4. App Description
SpiceGarden is a food delivery platform connecting customers with their favorite local restaurants. Browse menus, place orders, and track delivery in real time.

**Key Features:**
- Browse thousands of restaurants with real-time menu updates
- Place orders with a single tap — saved payment methods and addresses
- Real-time order tracking with live delivery partner location
- Multiple payment options: credit/debit cards, UPI, net banking, wallet, and cash on delivery
- Personalized recommendations based on your order history
- Exclusive offers and discounts for app users
- Contactless delivery option for every order
- Schedule orders up to 30 days in advance
- Reorder favorites with one tap
- Customer support through in-app chat

**Privacy:** We collect only the data necessary to operate the service. Review our full Privacy Policy and manage your data preferences at any time.

**Backend references:**
- App config: `apps/customer-mobile/app.config.js:1-110`
- Bundle ID: `apps/customer-mobile/app.config.js:25` — `com.spicegarden.customer`
- Permissions: `apps/customer-mobile/app.config.js:50-61` — location, camera, storage, notifications
- Deep links: `apps/customer-mobile/app.config.js:88-110` — schemes `spicegarden`, `spicegarden-cash`
- Privacy screen: `apps/customer-mobile/src/screens/PrivacyScreen.tsx:65-70` — ConsentState interface

## 5. Keywords
food delivery, restaurants, order online, food app, quick delivery, local food, takeaways, hungry, meal delivery, groceries, contactless delivery

## 6. Support URL
https://help.spicegarden.com

## 7. Marketing URL
https://www.spicegarden.com

## 8. Privacy Policy URL
https://www.spicegarden.com/privacy-policy

## 9. Age Rating

| Rating | Reason |
|---|---|
| 12+ | Infrequent/Mild Medical/Treatment Information (food allergies), Infrequent/Mild Location Context, Infrequent/Mild Personal Info |

**Data types used:**
- Contact Info: Name, email, phone (for account and delivery)
- Location: Delivery address, GPS for tracking (consent-gated)
- Payment Data: Payment card info via Stripe/Razorpay (tokenized)
- Sensitive Data: None collected

**Backend reference:** `apps/customer-mobile/App.tsx:120-129` — deep linking for `spicegarden://pay` and `spicegarden-cash://cod` schemes.

## 10. Screenshots

| Device | Screenshot |
|---|---|
| iPhone 6.7" | `assets/screenshots/iphone-67-customer-home.png` |
| iPhone 6.7" | `assets/screenshots/iphone-67-customer-tracking.png` |
| iPhone 6.7" | `assets/screenshots/iphone-67-customer-checkout.png` |
| iPad | `assets/screenshots/ipad-customer-home.png` |

## 11. App Icon
`apps/customer-mobile/assets/icon.png`

## 12. Feature Graphic
`apps/customer-mobile/assets/splash.png`

## 13. Permissions Justifications

| Permission | Purpose | App Store Justification |
|---|---|---|
| Location | Show nearby restaurants and track delivery | "SpiceGarden needs your location to show nearby restaurants and track your orders." (`app.config.js:30-32`) |
| Camera | Scan QR codes for payments | "SpiceGarden needs camera access to scan QR codes for payments." (`app.config.js:35`) |
| Photo Library | Upload payment receipts | "SpiceGarden needs photo library access to upload payment receipts." (`app.config.js:36`) |
| Notifications | Order updates and delivery tracking | "SpiceGarden sends notifications for order updates and delivery tracking." (`app.config.js:34`) |

## 14. What's New (Version 1.0.0)
- Browse thousands of restaurants
- Real-time order tracking with live delivery partner location
- Multiple payment options including COD, UPI, cards, and wallet
- Contactless delivery available
- Reorder favorites with one tap

## 15. Category
Food & Drink

---

*This document is a DRAFT. For App Store submission, verify all metadata against current app store guidelines.*
