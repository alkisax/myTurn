# 📱 EXPO / REACT NATIVE NOTES (ASTRO APP)

---

## 🔹 INIT

```bash
npx create-expo-app astro-native
npm start
npm run reset-project
```

---

## 🔹 BASIC COMPONENTS

```txt
<Image />
<ScrollView />
<FlatList />
<TouchableOpacity />
<TextInput />
<Button />
<Switch />
```

---

## 🔹 STRUCTURE (expo-router)

- `_layout.tsx`
- `index.tsx`

---

## 🔹 STYLES

```ts
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {}
})

<View style={styles.container} />
```

---

## 🔹 LIBS

```bash
npm install socket.io-client
npm i expo-av
npm i jwt-decode
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-webview
npm i react-native-paper
npm i react-native-safe-area-context
```

---

## 🔹 FIX CACHE / TS ISSUES

```bash
rm -rf .expo node_modules/.cache
npx expo start --tunnel --clear
```

---

# 🌐 BACKEND CONFIG

```ts
export const backendUrl = "https://astro.portfolio-projects.space";
export const interpretationUrl = backendUrl;
export const url = `${backendUrl}/api/astro/calculate`;
```

👉 ΔΕΝ χρησιμοποιούμε localhost στο mobile

---

# 🎨 ICON SETUP (ANDROID)

## files

```txt
assets/images/icon.png
assets/images/android-icon-foreground.png
```

---

## app.json

```json
"icon": "./assets/images/icon.png",

"android": {
  "package": "com.alkis.astronative",
  "versionCode": 1,
  "adaptiveIcon": {
    "backgroundColor": "#E6F4FE",
    "foregroundImage": "./assets/images/android-icon-foreground.png"
  }
}
```

---

## 🧠 ADAPTIVE ICON EXPLAIN

- foreground → logo (transparent PNG)
- background → color
- Android κάνει mask (circle/square)

---

## 🎨 AFFINITY PHOTO (ICON PREP)

### remove background

- Flood Select Tool (magic wand)
- click λευκό
- Delete → checkerboard

---

### resize (IMPORTANT)

- Move Tool
- scale ~70%
- padding γύρω γύρω

---

### export

```txt
PNG (ΟΧΙ JPEG)
1024x1024
transparent background
```

---

# 📦 EAS BUILD SETUP

## install

```bash
npm i -g eas-cli
eas login
```

---

## init

```bash
eas init
```

👉 προσθέτει στο `app.json`:

```json
"extra": {
  "eas": {
    "projectId": "..."
  }
},
"owner": "alkisax"
```

---

## eas.json

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

---

## 🚀 BUILD APK

```bash
eas build --platform android --profile preview --clear-cache
```

👉 δίνει `.apk`

---

## 📦 BUILD AAB (για Play Store)

```bash
eas build --platform android --profile production
```

---

# ❗ IMPORTANT NOTES

### ποιο παλια είχαμε κάνει:

```json
"production": {
  "android": {
    "buildType": "apk"
  }
}
```

👉 κράτα:
- preview → apk
- production → aab

---

# 🔐 KEYSTORE

όταν σε ρωτήσει:

```txt
Generate a new Android Keystore?
```

👉 απάντα:

```txt
Y
```

---
### μετα
✔ Build finished
🤖 Android app:
https://expo.dev/artifacts/eas/bzzjizeKQZKQEmE43e1G7F.apk

# 📱 INSTALL APK

- κατεβάζεις το link
- install manually στο κινητό
- allow unknown sources

---



## icon δεν αλλάζει

```bash
eas build --clear-cache
```

---

# 🧠 WORKFLOW

```bash
git add .
git commit -m "before build"
git push

eas build --platform android --profile preview
```