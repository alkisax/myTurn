import { useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

import { bannerAdUnitId } from "@/constants/constants";

const AdsBanner = () => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <View style={{ alignItems: "center" }}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={(error) => {
          console.warn("Native banner ad failed to load:", error);
          setFailed(true);
        }}
      />
    </View>
  );
};

export default AdsBanner;
