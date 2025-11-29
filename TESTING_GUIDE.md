# Testing Guide for Warehouse QR App

## Option 1: Physical Device (Easiest - Recommended)

### Steps:
1. **Install Expo Go** on your Android phone from Google Play Store
2. **Start the development server:**
   ```powershell
   cd C:\Users\jo\WebstormProjects\warehouseQR
   npm start
   ```
3. **Scan the QR code** that appears in your terminal with the Expo Go app
4. The app will load on your phone

### Testing Delete Functionality:
1. Navigate to the **History** tab
2. Make sure you have some history entries (scan QR codes or generate some)
3. On any history card, you should see three icons:
   - **Copy icon** (left)
   - **Edit icon** (middle)
   - **Delete icon** (right) ← NEW!
4. Tap the **delete icon** (trash can icon)
5. A confirmation dialog should appear: "Are you sure you want to delete this history entry?"
6. Tap **Delete** to confirm
7. The entry should disappear from the list immediately
8. Verify it's gone by checking AsyncStorage or refreshing the history

---

## Option 2: Android Emulator

### Prerequisites:
- **Android Studio** (includes Android SDK and emulator)

### Installation Steps:

#### 1. Install Android Studio
1. Download from: https://developer.android.com/studio
2. Run the installer
3. During setup, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

#### 2. Set Up Android Emulator
1. Open **Android Studio**
2. Go to **Tools** → **Device Manager** (or click the device icon in toolbar)
3. Click **Create Device**
4. Choose a device (e.g., **Pixel 5** or **Pixel 6**)
5. Click **Next**
6. Select a system image (e.g., **API 33** or **API 34** - latest stable)
7. Click **Download** if needed, then **Next**
8. Review settings and click **Finish**

#### 3. Start the Emulator
1. In Device Manager, click the **Play** button next to your device
2. Wait for the emulator to boot (first time may take a few minutes)

#### 4. Install Expo Go on Emulator
1. Once emulator is running, open **Google Play Store** in the emulator
2. Search for **"Expo Go"**
3. Install it

#### 5. Run Your App
1. In your project terminal, run:
   ```powershell
   npm start
   ```
2. Press **`a`** in the terminal to open on Android emulator
   - OR scan the QR code with Expo Go in the emulator

---

## Option 3: Web Browser (Limited - Some features may not work)

```powershell
npm run web
```

**Note:** Camera and some native features won't work on web, but you can test basic UI.

---

## Testing Checklist for Delete Feature

### ✅ Basic Functionality
- [ ] Delete icon appears next to edit button on each history card
- [ ] Icon is visible and properly styled (lime green color)
- [ ] Icon is clickable/tappable

### ✅ Delete Flow
- [ ] Tapping delete shows confirmation dialog
- [ ] Dialog has "Cancel" and "Delete" options
- [ ] Tapping "Cancel" does nothing (entry remains)
- [ ] Tapping "Delete" removes the entry from the list
- [ ] Entry is removed from AsyncStorage (persists after app restart)

### ✅ Edge Cases
- [ ] Delete works with filtered/search results
- [ ] Delete works with multiple entries
- [ ] Delete works with the last entry in history
- [ ] After deleting, empty state shows correctly if no entries remain

### ✅ UI/UX
- [ ] Delete icon spacing is consistent with other icons
- [ ] Icon size matches edit icon (16px)
- [ ] Color matches other action icons (#D5FF40)

---

## Quick Test Commands

```powershell
# Start development server
npm start

# Run on Android (if emulator is running)
npm run android

# Run on iOS (Mac only)
npm run ios

# Run on web
npm run web
```

---

## Troubleshooting

### Emulator Issues:
- **Emulator is slow?** Enable hardware acceleration in Android Studio settings
- **Can't find device?** Make sure emulator is fully booted before running `npm run android`
- **ADB not found?** Add Android SDK platform-tools to your PATH

### Expo Issues:
- **Connection refused?** Make sure phone/emulator is on the same network
- **App won't load?** Try clearing Expo Go cache or restarting the dev server

---

## Environment Variables (if needed)

Make sure you have:
- Node.js installed
- npm or yarn installed
- Expo CLI (usually comes with `npm install`)

