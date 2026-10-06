import { useEffect, useRef, useState } from "react";
import {
  AdEventType,
  InterstitialAd,
} from "react-native-google-mobile-ads";

import { interstitialAdUnitId } from "@/constants/constants";
import { useAdsConsent } from "@/context/AdsConsentContext";

type CompletionResolver = (completed: boolean) => void;

export const useInterstitialAd = () => {
  const { isConsentReady, canRequestAds } = useAdsConsent();
  const adRef = useRef<InterstitialAd | null>(null);
  const completionResolverRef = useRef<CompletionResolver | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isConsentReady || !canRequestAds) {
      return undefined;
    }

    const ad = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoaded(true);
    });
    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setIsLoaded(false);
      completionResolverRef.current?.(true);
      completionResolverRef.current = null;
      ad.load();
    });
    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.warn("Native interstitial ad error:", error);
        setIsLoaded(false);
        completionResolverRef.current?.(false);
        completionResolverRef.current = null;
      },
    );

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      completionResolverRef.current?.(false);
      completionResolverRef.current = null;
      adRef.current = null;
    };
  }, [canRequestAds, isConsentReady]);

  const showInterstitial = () => {
    const ad = adRef.current;
    if (!isLoaded || !ad || completionResolverRef.current) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      completionResolverRef.current = resolve;
      setIsLoaded(false);
      try {
        void ad.show();
      } catch (error: unknown) {
        console.warn("Native interstitial ad failed to show:", error);
        completionResolverRef.current = null;
        resolve(false);
      }
    });
  };

  return { isLoaded, showInterstitial };
};
