# SpiceGarden Android Production Signing Guide

## Overview

This guide covers how to configure, manage, and rotate production signing keys for the SpiceGarden Android applications.

## Apps Covered

- `apps/customer-mobile/android`
- `apps/delivery-partner/android`

## 1. Creating a JKS Keystore

### Using Java Keytool

```bash
keytool -genkeypair -v \
  -keystore spicegarden-release.keystore \
  -alias spicegarden \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=SpiceGarden, OU=Mobile, O=SpiceGarden Inc, L=Mumbai, ST=Maharashtra, C=IN"
```

### Using Android Studio

1. Open the project in Android Studio
2. Go to **Build > Generate Signed Bundle / APK**
3. Select **Android App Bundle** (for AAB) or **APK**
4. Click **Create new...**
5. Fill in the keystore path, password, alias, and key password
6. Click **OK** to generate

## 2. Configuring Production Signing

### Environment Variables

Set these environment variables in your CI/CD pipeline or local environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `KEYSTORE_FILE` | Path to the keystore file | `/secrets/spicegarden-release.keystore` |
| `KEYSTORE_PASSWORD` | Keystore password | `your_secure_password` |
| `KEY_ALIAS` | Key alias | `spicegarden` |
| `KEY_PASSWORD` | Key password | `your_key_password` |

### Gradle Properties (Local Development)

In `apps/customer-mobile/android/gradle.properties` and `apps/delivery-partner/android/gradle.properties`:

```properties
KEYSTORE_FILE=path/to/spicegarden-release.keystore
KEYSTORE_PASSWORD=your_password
KEY_ALIAS=spicegarden
KEY_PASSWORD=your_key_password
```

**WARNING**: Never commit keystore files or passwords to version control.

### CI/CD Configuration

In your CI pipeline, inject the keystore as a secret file and set environment variables:

```yaml
# Example GitHub Actions (if applicable)
- name: Build Release APK
  run: |
    echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/spicegarden-release.keystore
    export KEYSTORE_FILE=android/app/spicegarden-release.keystore
    export KEYSTORE_PASSWORD=${{ secrets.KEYSTORE_PASSWORD }}
    export KEY_ALIAS=${{ secrets.KEY_ALIAS }}
    export KEY_PASSWORD=${{ secrets.KEY_PASSWORD }}
    cd android && ./gradlew assembleRelease
```

## 3. Key Rotation

### When to Rotate Keys

- Key compromise suspected
- Key expiration approaching (validity period set at creation)
- Security policy requires periodic rotation
- Employee departure with key access

### Rotation Process

1. **Generate new keystore**:
   ```bash
   keytool -genkeypair -v \
     -keystore spicegarden-release-v2.keystore \
     -alias spicegarden-v2 \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000 \
     -dname "CN=SpiceGarden, OU=Mobile, O=SpiceGarden Inc, L=Mumbai, ST=Maharashtra, C=IN"
   ```

2. **Update environment variables** with new keystore path and credentials

3. **Build and sign** the new release with the new keystore

4. **Update Google Play Console** with the new signing key (see Section 5)

5. **Archive the old keystore** securely — do not delete until all apps signed with it are removed from Play Store

### Important: Google Play App Signing

If using Google Play App Signing (recommended):
- Upload the **new** signing key to Google Play Console
- Google Play will re-sign the APK/AAB with its own key for distribution
- Keep your upload key secure; Google Play manages the distribution key

## 4. Secrets Management

### Storage Locations

| Environment | Storage Method |
|-------------|---------------|
| Local dev | `gradle.properties` (gitignored) |
| CI/CD | Pipeline secrets (GitHub Secrets, GitLab CI Variables, etc.) |
| Production | Kubernetes secrets or vault |

### Gitignore Coverage

The following patterns are already in `.gitignore`:
```
*.keystore
*.jks
*.p12
*.pfx
```

### Security Best Practices

- Never hardcode passwords in build files
- Never commit keystore files to version control
- Use different keystores for different environments (staging vs production)
- Rotate keys periodically (every 6-12 months)
- Use strong passwords (minimum 16 characters, mixed case, numbers, symbols)
- Store keystore backups in a secure location (e.g., encrypted vault, physical safe)

## 5. Google Play Upload Instructions

### Prerequisites

1. Google Play Developer account
2. App registered in Google Play Console
3. Production signing key configured (either upload key or Google Play App Signing key)

### Upload Process

1. **Build the AAB**:
   ```bash
   cd apps/customer-mobile/android
   export KEYSTORE_FILE=/path/to/keystore.jks
   export KEYSTORE_PASSWORD=your_password
   export KEY_ALIAS=your_alias
   export KEY_PASSWORD=your_key_password
   ./gradlew bundleRelease
   ```

2. **Locate the AAB**:
   - Output: `app/build/outputs/bundle/release/app-release.aab`

3. **Upload to Google Play Console**:
   - Go to **Google Play Console > Your App > Production**
   - Click **Create new release**
   - Upload the AAB file
   - Fill in release notes
   - Review and start rollout

### Internal Testing Track

For testing before production rollout:

1. Build the AAB as above
2. In Google Play Console, go to **Internal testing** track
3. Upload the AAB
4. Add testers via email or Google Groups
5. Testers can install via the Play Store or the testing link

## 6. Build Commands

### Release APK

```bash
cd apps/customer-mobile/android
export KEYSTORE_FILE=/path/to/keystore.jks
export KEYSTORE_PASSWORD=your_password
export KEY_ALIAS=your_alias
export KEY_PASSWORD=your_key_password
./gradlew assembleRelease
```

### Release AAB

```bash
cd apps/customer-mobile/android
export KEYSTORE_FILE=/path/to/keystore.jks
export KEYSTORE_PASSWORD=your_password
export KEY_ALIAS=your_alias
export KEY_PASSWORD=your_key_password
./gradlew bundleRelease
```

### Verify Build Output

```bash
# Check APK signature
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk

# Check AAB signature (requires bundletool)
bundletool verify --bundle app/build/outputs/bundle/release/app-release.aab
```

## 7. Troubleshooting

### Keystore File Not Found

Ensure `KEYSTORE_FILE` points to the correct absolute path or relative path from the `android/` directory.

### Wrong Password

Double-check that `KEYSTORE_PASSWORD` and `KEY_PASSWORD` match the keystore and key passwords exactly (case-sensitive).

### APK Signature Verification Failed

The APK may be corrupted or signed with the wrong key. Rebuild from scratch and verify the keystore credentials.

### Gradle Properties Not Loading

Ensure `gradle.properties` is in the correct directory (`android/` not `android/app/`) and that the properties are not commented out.