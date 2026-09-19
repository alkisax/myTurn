import { useContext, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';

type MockInterstitialAdProps = {
  visible: boolean;
  onCompleted: () => void;
};

const MockInterstitialAd = ({
  visible,
  onCompleted,
}: MockInterstitialAdProps) => {
  const { colors, language } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [countdown, setCountdown] = useState(3);
  const completionRef = useRef(onCompleted);

  completionRef.current = onCompleted;

  useEffect(() => {
    if (!visible) {
      setCountdown(3);
      return;
    }

    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((currentCountdown) => {
        if (currentCountdown <= 1) {
          clearInterval(timer);
          completionRef.current();
          return 1;
        }

        return currentCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  const text = language === 'en'
    ? {
        title: 'Advertisement',
        description: 'Mock interstitial advertisement',
        wait: 'Please wait...',
      }
    : {
        title: 'Διαφήμιση',
        description: 'Δοκιμαστική interstitial διαφήμιση',
        wait: 'Παρακαλώ περιμένετε...',
      };

  return (
    <Modal
      animationType='fade'
      onRequestClose={() => undefined}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={globalStyles.title}>{text.title}</Text>
          <Text style={globalStyles.text}>{text.description}</Text>
          <Text style={globalStyles.dimText}>{text.wait}</Text>
          <Text style={[globalStyles.title, styles.countdown]}>
            {countdown}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: SPACING.lg,
  },
  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    gap: SPACING.sm,
    maxWidth: 360,
    padding: SPACING.xl,
    width: '100%',
  },
  countdown: {
    fontSize: 48,
    marginTop: SPACING.sm,
  },
});

export default MockInterstitialAd;
