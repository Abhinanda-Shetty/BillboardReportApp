import React from "react";
import { Text, StyleSheet, View, ViewStyle } from "react-native";

export default function Tag({
  label,
  style,
}: {
  label: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.tag, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  text: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "600",
  },
});
