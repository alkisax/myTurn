// native\src\styles\mainIndex.styles.ts

import { StyleSheet } from "react-native";

export const mainIndexStyles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  gameCard: {
    width: "48%",
    height: 82,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  gameCardText: {
    textAlign: "center",
    zIndex: 1,
  },

  blackHolePreview: {
    position: "absolute",
    left: -18,
    top: -24,
    opacity: 0.22,
  },

  pferdApfelPreview: {
    position: "absolute",
    left: -18,
    top: -18,
    opacity: 0.22,
  },

  paperAirfightPreview: {
    position: "absolute",
    left: -7,
    top: 0,
    opacity: 0.24,
  },

  dandelionsPreview: {
    position: "absolute",
    left: -18,
    top: -20,
    opacity: 0.24,
  },

  hexPreview: {
    position: "absolute",
    left: -18,
    top: -16,
    opacity: 0.24,
  },

  hedronPreview: {
    position: "absolute",
    left: -18,
    top: -24,
    opacity: 0.25,
  },

  dotsAndBoxesPreview: {
    position: "absolute",
    left: -18,
    top: -24,
    opacity: 0.25,
  },
});
