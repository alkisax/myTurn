// // native\src\ads\useInterstitialAd.ts

// import { useEffect, useRef, useState } from "react";
// import {
//   InterstitialAd,
//   AdEventType,
//   TestIds,
// } from "react-native-google-mobile-ads";
// import { interstitialAdUnitId } from "@/constants/constants";
// import { logToServer } from "@/utils/logToServer";

// // const adUnitId = TestIds.INTERSTITIAL;
// const adUnitId = interstitialAdUnitId

// export const useInterstitialAd = () => {
//   const adRef = useRef<InterstitialAd | null>(null);
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//     logToServer("INTERSTITIAL INIT");

//     const ad = InterstitialAd.createForAdRequest(adUnitId, {
//       requestNonPersonalizedAdsOnly: true,
//     });

//     adRef.current = ad;

//     const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
//       setLoaded(true);
//       logToServer("INTERSTITIAL LOADED");
//     });

//     const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
//       setLoaded(false);
//       logToServer("INTERSTITIAL CLOSED → reload");
//       ad.load();
//     });

//     const unsubError = ad.addAdEventListener(AdEventType.ERROR, (e) => {
//       logToServer("INTERSTITIAL ERROR " + JSON.stringify(e));
//     });

//     logToServer("INTERSTITIAL LOAD START");
//     ad.load();

//     return () => {
//       unsubLoaded();
//       unsubClosed();
//       unsubError();
//     };
//   }, []);

//   const showAd = () => {
//     if (loaded && adRef.current) {
//       logToServer("INTERSTITIAL SHOW");
//       adRef.current.show();
//     } else {
//       logToServer("INTERSTITIAL NOT READY");
//     }
//   };

//   return { showAd, loaded };
// };
