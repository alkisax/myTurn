// // native\src\ads\SupportDeveloperAdButton.tsx
// import {
//   Pressable,
//   Text,
// } from 'react-native'
// import { useContext } from 'react'

// import { ThemeContext } from '@/context/ThemeContext'
// import { createGlobalStyles } from '@/styles/global'
// import { useInterstitialAd } from '@/ads/useInterstitialAd'

// const SupportDeveloperAdButton = () => {
//   const { colors } = useContext(ThemeContext)
//   const globalStyles = createGlobalStyles(colors)

//   const {
//     showAd,
//     loaded,
//   } = useInterstitialAd()

//   return (
//     <Pressable
//       style={[
//         globalStyles.secondaryButton,
//         {
//           opacity: loaded ? 1 : 0.55,
//         },
//       ]}
//       onPress={showAd}
//       disabled={!loaded}
//     >
//       <Text style={globalStyles.secondaryButtonText}>
//         Watch an ad to support the developer
//       </Text>
//     </Pressable>
//   )
// }

// export default SupportDeveloperAdButton