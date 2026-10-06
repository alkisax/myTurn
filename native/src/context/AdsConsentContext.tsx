import {
  AdsConsent,
  AdsConsentInfo,
  AdsConsentPrivacyOptionsRequirementStatus,
} from "react-native-google-mobile-ads";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AdsConsentContextValue {
  isConsentReady: boolean;
  canRequestAds: boolean;
  privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus;
  showPrivacyOptions: () => Promise<void>;
}

const AdsConsentContext = createContext<
  AdsConsentContextValue | undefined
>(undefined);

const AdsConsentProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [isConsentReady, setIsConsentReady] = useState(false);
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [privacyOptionsRequirementStatus, setPrivacyOptionsRequirementStatus] =
    useState<AdsConsentPrivacyOptionsRequirementStatus>(
      AdsConsentPrivacyOptionsRequirementStatus.UNKNOWN,
    );

  const updateConsentState = useCallback((consentInfo: AdsConsentInfo) => {
    setCanRequestAds(consentInfo.canRequestAds);
    setPrivacyOptionsRequirementStatus(
      consentInfo.privacyOptionsRequirementStatus,
    );
  }, []);

  useEffect(() => {
    let ignore = false;

    AdsConsent.requestInfoUpdate()
      .then(() => AdsConsent.loadAndShowConsentFormIfRequired())
      .then(() => AdsConsent.getConsentInfo())
      .then((consentInfo) => {
        if (!ignore) {
          updateConsentState(consentInfo);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.warn("Google consent flow failed:", error);
          setCanRequestAds(false);
          setIsConsentReady(true);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsConsentReady(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, [updateConsentState]);

  const showPrivacyOptions = useCallback(async () => {
    try {
      const consentInfo = await AdsConsent.showPrivacyOptionsForm();
      updateConsentState(consentInfo);
    } catch (error: unknown) {
      console.warn("Google privacy options failed:", error);
    }
  }, [updateConsentState]);

  const value = useMemo(
    () => ({
      isConsentReady,
      canRequestAds,
      privacyOptionsRequirementStatus,
      showPrivacyOptions,
    }),
    [
      canRequestAds,
      isConsentReady,
      privacyOptionsRequirementStatus,
      showPrivacyOptions,
    ],
  );

  return (
    <AdsConsentContext.Provider value={value}>
      {children}
    </AdsConsentContext.Provider>
  );
};

export const useAdsConsent = () => {
  const context = useContext(AdsConsentContext);

  if (!context) {
    throw new Error("useAdsConsent must be used within AdsConsentProvider");
  }

  return context;
};

export { AdsConsentProvider };
