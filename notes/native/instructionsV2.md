https://www.youtube.com/watch?v=XCifkDC0yXA


from expo.dev
npm install --global eas-cli && 
npx create-expo-app macrozone && 
cd macrozone && 
eas init --id 9a1376b4-c8da-4936-9875-e9a07371f104


σε αντίθεση με τα μέχρι τώρα κάνουμε init με
`npx create-expo-app@latest --template default@sdk-55`
για να έχουμε το νέο sdk

και μετα κάνουμε την init συνδεση με το eas
`eas init --id 9a1376b4-c8da-4936-9875-e9a07371f104`

reset project
`npm run reset-project`

πληροφορίες reactnative.dev → development → components

localstorage
`npx expo install @react-native-async-storage/async-storage`

vibration
`npx expo install expo-haptics`

notifications
`npx expo install expo-notifications`

build
`npx eas build --platform android`
 ή για apk με προσθήκη στο eas.json
 `eas build --platform android --profile preview`

 svg
 `npm install react-native-svg`