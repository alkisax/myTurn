## 1
```bash
npx expo prebuild --platform android

keytool -genkeypair -v -storetype PKCS12 -keystore android/app/learn-greek-upload-key.keystore -alias learn-greek-key -keyalg RSA -keysize 2048 -validity 10000
```

## 2
Θα βάλουμε τα passwords σε:
android/gradle.properties
και το signing block στο:
android/app/build.gradle

φέρνω το local.properties
```
sdk.dir=C:/Users/Administrator/AppData/Local/Android/Sdk
```

φτιάχνω keystore.properties
```
MYAPP_UPLOAD_STORE_FILE=learn-greek-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=learn-greek-key
MYAPP_UPLOAD_STORE_PASSWORD=210***
MYAPP_UPLOAD_KEY_PASSWORD=210***
```

## 3
ανοιγω το android/app/build.gradle

Βάλε πάνω από το android {:

def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()

if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

Μετά άλλαξε το signingConfigs σε:

signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }

    release {
        storeFile file(keystoreProperties['MYAPP_UPLOAD_STORE_FILE'])
        storePassword keystoreProperties['MYAPP_UPLOAD_STORE_PASSWORD']
        keyAlias keystoreProperties['MYAPP_UPLOAD_KEY_ALIAS']
        keyPassword keystoreProperties['MYAPP_UPLOAD_KEY_PASSWORD']
    }
}

Και μέσα στο buildTypes.release άλλαξε:

signingConfig signingConfigs.debug

σε:

signingConfig signingConfigs.release

## 4
cd android
.\gradlew.bat bundleRelease

## 5
συναντησα
> Task :react-native-google-mobile-ads:compileReleaseKotlin FAILED
Το πρόβλημα είναι ότι εγκαταστάθηκε η 16.4.0, η οποία φέρνει Google Ads SDK 25.4.0, χτισμένο με Kotlin metadata 2.3.0. Το project σου χρησιμοποιεί Kotlin 2.1.0.
Κάνε downgrade στην αμέσως προηγούμενη έκδοση:
cd ..
npm install react-native-google-mobile-ads@16.3.4 --save-exact
cd android
.\gradlew.bat clean
.\gradlew.bat bundleRelease