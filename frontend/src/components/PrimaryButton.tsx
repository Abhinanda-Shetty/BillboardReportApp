import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
};

export default function PrimaryButton({
  label,
  onPress,
  style,
  disabled,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0A84FF",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
