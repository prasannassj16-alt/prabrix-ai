# PRABRIX AI - Android APK Build & Release Guide

This guide details how to build, test, and release the **PRABRIX AI** Android mobile application using Capacitor and Gradle.

---

## 1. App Identity & Architecture

| Parameter | Value | Location |
| :--- | :--- | :--- |
| **App Name** | PRABRIX AI | `capacitor.config.json` & `android/app/src/main/res/values/strings.xml` |
| **Package ID / App ID** | `tech.prabrix.app` | `capacitor.config.json` & `android/app/build.gradle` |
| **WebView Scheme** | `https` (origin: `https://localhost`) | `capacitor.config.json` (`server.androidScheme`) |
| **Deep Link Scheme** | `tech.prabrix.app://` | `android/app/src/main/AndroidManifest.xml` |
| **Current Version** | `versionCode 1`, `versionName "1.0.0"` | `android/app/build.gradle` (`defaultConfig`) |

> [!NOTE]
> If you prefer a different Application ID (such as `in.prabrix.land` or `com.prabrix.ai`), update `appId` in `capacitor.config.json` and `applicationId` / `namespace` in `android/app/build.gradle`.

---

## 2. Prerequisites

1. **Android Studio** (Hedgehog 2023.1.1 or Ladybug 2024.2+) or **Android SDK Platform-Tools**.
   - Your local Android SDK is already present at:
     `C:\Users\<username>\AppData\Local\Android\Sdk`
2. **Java Development Kit (JDK 17 or JDK 21)**.
   - Android Gradle Plugin 8+ requires JDK 17+. You can use the JDK bundled inside Android Studio (`<Android Studio Path>/jbr`) or install Eclipse Adoptium Temurin JDK 17 (`winget install EclipseAdoptium.Temurin.17.JDK`).
3. **Android Device or Emulator** with Developer Options and USB Debugging enabled.

---

## 3. Environment & API Configuration

When running inside the Android APK, the app must connect to your **deployed backend API** rather than `localhost`:

1. Copy `.env.production.example` to `.env.production`:
   ```bash
   cp .env.production.example .env.production
   ```
2. Set your live deployed endpoints:
   ```properties
   VITE_SUPABASE_URL=https://your-production-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-anon-key
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

### Supabase Auth Redirects Configuration
To allow mobile deep links for password reset and email verification to redirect smoothly back into the Android app:
1. Open your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Under **Redirect URLs**, add the following entries:
   - `tech.prabrix.app://*`
   - `tech.prabrix.app://reset-password`
   - `https://localhost/*`
   - `https://localhost/reset-password`
   - `https://your-production-domain.com/*`

### Google Maps API Key Restrictions
1. Open **Google Cloud Console** -> **APIs & Services** -> **Credentials**.
2. Select your Google Maps Browser Key -> **Application restrictions** -> **Websites** (HTTP referrers).
3. Add the following allowed referrers:
   - `https://localhost/*` *(Required for Capacitor Android WebView)*
   - `http://localhost:*/*` *(For local web testing)*
   - `https://your-production-domain.com/*` *(For production web)*
4. Keep all server keys (Geocoding API, Places Server API) strictly backend-only in `.env`.

---

## 4. Building the Mobile Web Assets

Before every native Android build, compile the web distribution and sync it into the native Android assets:

```bash
npm run build:mobile
```
*This command executes `vite build` and then `npx cap sync android` to copy `dist/` into `android/app/src/main/assets/public`.*

---

## 5. Building a Debug APK

### Option A: Via Command Line (Gradle)
From the project root:
```powershell
cd android
.\gradlew assembleDebug
```
The output debug APK will be created at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

To install directly onto a connected phone over USB (with USB debugging enabled):
```powershell
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Via Android Studio
```bash
npm run android:open
```
1. Android Studio will open the `android` folder.
2. Wait for Gradle sync to complete.
3. Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
4. When finished, click the **locate** popup link to view `app-debug.apk`.

---

## 6. Creating a Release Keystore & Building a Signed APK

> [!CAUTION]
> **STRICT SECURITY RULE**: Never commit your keystore (`*.jks`) or passwords to git! `android/.gitignore` and `.gitignore` are already configured to ignore `*.jks`, `*.keystore`, and `android/gradle.properties`.

### Step 1: Generate a Private Signing Keystore
Run `keytool` (included with your JDK) in a secure directory:
```powershell
keytool -genkey -v -keystore prabrix-release-key.jks -alias prabrix-key -keyalg RSA -keysize 2048 -validity 10000
```
Enter your organization details and set a strong password. Keep this file backed up safely (if lost, you cannot update your app on Google Play).

### Step 2: Configure `android/gradle.properties`
Copy `android/gradle.properties.example` to `android/gradle.properties`:
```properties
RELEASE_STORE_FILE=../../prabrix-release-key.jks
RELEASE_STORE_PASSWORD=your_secure_keystore_password
RELEASE_KEY_ALIAS=prabrix-key
RELEASE_KEY_PASSWORD=your_secure_key_password
```
*(Path is relative to the `android/app` directory).*

### Step 3: Compile Signed Release APK
Run:
```powershell
cd android
.\gradlew assembleRelease
```
The signed release APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 7. Version Bumping for Updates

When releasing app updates, update both `versionCode` and `versionName` in [`android/app/build.gradle`](file:///c:/MAIN_PROJECT/android/app/build.gradle):

```groovy
defaultConfig {
    applicationId "tech.prabrix.app"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 2          // Increment by 1 on every release (Integer)
    versionName "1.1.0"    // User-facing semantic version string
    ...
}
```

---

## 8. Mobile Device Testing Checklist

When testing on a real Android phone:
1. **App Launch & Branding**: Splash screen in deep navy (`#0B132B`), launcher icon rendered clearly on the home screen.
2. **Status Bar & Gesture Navigation**: Status bar in dark style matching theme, bottom navigation bar leaves clear padding above the Android gesture bar.
3. **Android Hardware Back Button**:
   - Pressing back on inner pages (`/buy`, `/property/:id`, `/analysis`, `/sell`) navigates backward through route history.
   - Pressing back on the homepage (`/`) prompts: *"Press back again to exit PRABRIX AI"*, and exits on second press.
4. **Offline Resilience**: Turn on Airplane mode. The friendly *"No Internet Connection"* overlay appears with live data warning. Turn off Airplane mode and tap *"Retry Connection"*.
5. **GPS Geolocation**: In the Sell Land wizard (`/sell` Step 2), tap *"Use My Current Location"*. Confirm location permission prompt appears and marker drops at current coordinates.
6. **Camera & Photo Upload**: In `/sell` Step 4, tap *"Take Photo / Camera"* and verify native camera capture works and adds photo to the listing.
