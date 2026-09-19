import { useContext } from 'react';
import { Text, View } from 'react-native';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';

const MockAdBanner = () => {
  const { colors } = useContext(ThemeContext);
  const language = "en";
  const globalStyles = createGlobalStyles(colors);

  return (
    <View
      accessibilityLabel={
        language === 'en' ? 'Mock advertisement' : 'Δοκιμαστική διαφήμιση'
      }
      style={{
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.border,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        minHeight: 58,
        paddingHorizontal: SPACING.md,
        width: '100%',
      }}
    >
      <Text style={[globalStyles.dimText, { fontSize: 10 }]}>
        {language === 'en' ? 'Ad' : 'Διαφήμιση'}
      </Text>
      <Text style={[globalStyles.text, { fontSize: 13, fontWeight: '600' }]}>
        {language === 'en'
          ? 'Mock advertisement'
          : 'Δοκιμαστική διαφήμιση'}
      </Text>
      <Text style={[globalStyles.dimText, { fontSize: 10 }]}>
        {language === 'en'
          ? 'AdMob banner placeholder'
          : 'Προσωρινό banner AdMob'}
      </Text>
    </View>
  );
};

export default MockAdBanner;
