// native\src\components\layout\ScreenWrapper.tsx

import { Image, StyleSheet, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// const bgImage = require('../../assets/images/bubblePRNGrayInvertLongColor.jpg')

const { width, height } = Dimensions.get("window");

const BgScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      {/* background */}
      <Image
        // source={bgImage}
        style={[styles.bg, { width, height }]} // 👈 IMPORTANT
        resizeMode="cover"
      />

      {/* overlay */}
      <View style={styles.overlay} />

      {/* content */}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

export default BgScreenWrapper;

const styles = StyleSheet.create({
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
    pointerEvents: "none",
  },
  content: {
    flex: 1,
  },
});
