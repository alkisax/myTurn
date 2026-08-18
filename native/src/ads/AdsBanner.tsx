// // native\src\ads\AdsBanner.tsx
// import {
//   BannerAd,
//   BannerAdSize,
//   TestIds
// } from 'react-native-google-mobile-ads'
// import { View } from 'react-native'
// import { bannerAdUnitId } from '@/constants/constants'
// import { logToServer } from '@/utils/logToServer'

// const adUnitId = bannerAdUnitId
// // const adUnitId = TestIds.BANNER

// const AdsBanner = () => {
//   return (
//     <View style={{ alignItems: 'center' }}>
//       <BannerAd
//         unitId={adUnitId}
//         size={BannerAdSize.FULL_BANNER}
//         requestOptions={{
//           requestNonPersonalizedAdsOnly: true,
//         }}
//         onAdLoaded={() => logToServer('BANNER LOADED')}
//         onAdFailedToLoad={(e) =>
//           logToServer('BANNER ERROR ' + JSON.stringify(e))
//         }
//       />
//     </View>
//   )
// }

// export default AdsBanner