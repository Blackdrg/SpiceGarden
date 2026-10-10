# SpiceGarden v1.0.0-rc1 — Mobile Release & App Store Handover Runbook

**Release**: `v1.0.0-rc1`  
**Classification**: **`MOBILE SOFTWARE VERIFIED — STORE SIGNING/SUBMISSION PENDING`**  
**Audience**: Recipient Mobile Engineering & Release Operations Team  

---

## 1. Executive Summary & Verification State

The mobile client software for **SpiceGarden v1.0.0-rc1** encompasses two high-performance React Native / Expo applications:
1. **Customer Mobile Application** ([`apps/customer-mobile`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/customer-mobile))
2. **Delivery Partner Mobile Application** ([`apps/delivery-partner`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/delivery-partner))

Both applications are completely implemented, typecheck verified, React Doctor audited, and qualified via Expo/React Native Web harnesses. No proprietary signing keys or developer certificates are stored in the repository; key generation and store publishing remain the exclusive operational domain of the recipient organization.

---

## 2. Android Build & Signing Handover

### Application Identifiers
* **Customer App Package ID**: `com.spicegarden.customer`
* **Delivery Partner Package ID**: `com.spicegarden.delivery`
* **Version**: `1.0.0`
* **Version Code**: `10001`
* **Target Android SDK**: `34` (Android 14) / Min SDK: `24` (Android 7.0)

### Production AAB (Android App Bundle) Build Procedure
```bash
# 1. Navigate to mobile workspace
cd apps/customer-mobile   # or apps/delivery-partner

# 2. Export clean production assets
npx expo export --platform android

# 3. Build release AAB using recipient EAS / Gradle configuration
npx eas build --platform android --profile production
```

### Keystore Generation & Signing
The recipient must generate a unique, secure production release keystore:
```bash
keytool -genkeypair -v -keystore spicegarden-release.keystore \
  -alias spicegarden-key -keyalg RSA -keysize 2048 -validity 10000
```
Store the generated keystore file securely in the recipient's CI/CD secrets manager (e.g., EAS Secrets, GitHub Secrets, or AWS Secrets Manager).

### Firebase & Push Notifications
* **Configuration File**: Place recipient `google-services.json` in `apps/customer-mobile/` and `apps/delivery-partner/`.
* **FCM Server Key**: Inject recipient Firebase Cloud Messaging key into backend Kubernetes Secret `fcm-secret`.

---

## 3. iOS Build & Signing Handover

### Application Identifiers
* **Customer App Bundle ID**: `com.spicegarden.customer`
* **Delivery Partner Bundle ID**: `com.spicegarden.delivery`
* **Version / Marketing Version**: `1.0.0`
* **Build Number**: `10001`
* **Target iOS Version**: `16.0+`

### Production IPA Build Procedure
```bash
# 1. Navigate to workspace
cd apps/customer-mobile   # or apps/delivery-partner

# 2. Build iOS release archive
npx eas build --platform ios --profile production
```

### Apple Developer Portal & Signing Setup
1. Log in to Apple Developer Portal (`https://developer.apple.com`).
2. Register App IDs (`com.spicegarden.customer` and `com.spicegarden.delivery`).
3. Enable Capabilities:
   - **Push Notifications** (APNs)
   - **Background Modes** (Location updates, Remote notifications, Background fetch)
   - **Associated Domains** (Universal Links: `applinks:spicegarden.app`)
4. Create Distribution Certificate and App Store Provisioning Profiles using recipient Apple Team ID.

### APNs Configuration
* Generate APNs Authentication Key (`.p8` file) in Apple Developer Portal.
* Obtain **Key ID** and **Team ID**.
* Inject credentials into backend Kubernetes Secret `apns-secret`.

---

## 4. Production API Endpoint Binding

Update environment variables in the mobile application configs prior to final store release:

```bash
# Production API Gateway
EXPO_PUBLIC_API_URL=https://api.<recipient-domain>/api/v1

# Realtime WebSocket Gateway
EXPO_PUBLIC_WS_URL=wss://api.<recipient-domain>

# Google Maps Mobile SDK Key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=<RECIPIENT_MOBILE_MAPS_KEY>
```

---

## 5. Recipient Store Submission Checklist

- [ ] Recipient Google Play Developer Console account active & paid.
- [ ] Recipient Apple Developer Program organization account active.
- [ ] Privacy Policy URL published (`https://spicegarden.app/legal/privacy`).
- [ ] Terms of Service URL published (`https://spicegarden.app/legal/terms`).
- [ ] App Content declarations completed (Data safety, Target age, Financial features).
- [ ] Store screenshots and promotional graphics uploaded.
- [ ] App Reviewer demo credentials provided (`reviewer@spicegarden.app` / test OTP `999999`).
- [ ] Rollout set to Staged Rollout (10% → 25% → 50% → 100%).
