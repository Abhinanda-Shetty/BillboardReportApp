import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CameraMock() {
  return (
    <View style={styles.mock}>
      <View style={styles.crosshair} />
      <Text style={styles.caption}>Camera Preview (UI Mock)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mock: {
    height: 280,
    borderRadius: 16,
    backgroundColor: "#070404ff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  crosshair: {
    position: "absolute",
    width: 180,
    height: 120,
    borderWidth: 2,
    borderColor: "#f5e947ff",
    borderRadius: 6,
  },
  caption: {
    position: "absolute",
    bottom: 10,
    color: "#BDBDBD",
    fontSize: 12,
  },
});
