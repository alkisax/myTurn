generate key for android
```
keytool -genkeypair -v -storetype PKCS12 -keystore release-key.keystore -alias morsekey -keyalg RSA -keysize 2048 -validity 10000
```

native-morse-trainer\android\app\build.gradle
```
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }

    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}

buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }

    release {
        signingConfig signingConfigs.release

        def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'
        shrinkResources enableShrinkResources.toBoolean()

        minifyEnabled enableMinifyInReleaseBuilds

        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"

        def enablePngCrunchInRelease = findProperty('android.enablePngCrunchInReleaseBuilds') ?: 'true'
        crunchPngs enablePngCrunchInRelease.toBoolean()
    }
}
```


native-morse-trainer\android\gradle.properties
```
MYAPP_UPLOAD_STORE_FILE=release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=morsekey
MYAPP_UPLOAD_STORE_PASSWORD=τοpasswordσου
MYAPP_UPLOAD_KEY_PASSWORD=τοpasswordσου
```