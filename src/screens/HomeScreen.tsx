import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";
import CameraMock from "../components/CameraMock";

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📢 Billboard Reporter</Text>

      <Card style={styles.card}>
        <CameraMock />
        <View style={styles.row}>
          <PrimaryButton
            label="Open Camera"
            onPress={() => navigation.navigate("DetectionResult")}
            style={styles.flex}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label="Quick Report"
            onPress={() => navigation.navigate("ReportForm")}
            style={[styles.flex, styles.secondary]}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Shortcuts</Text>
        <View style={styles.grid}>
          <PrimaryButton
            label="Violation Criteria"
            onPress={() => navigation.navigate("ViolationCriteria")}
            style={styles.gridItem}
          />
          <PrimaryButton
            label="History"
            onPress={() => navigation.navigate("History")}
            style={styles.gridItem}
          />
          <PrimaryButton
            label="Leaderboard"
            onPress={() => navigation.navigate("Leaderboard")}
            style={styles.gridItem}
          />
          <PrimaryButton
            label="Privacy Notice"
            onPress={() => navigation.navigate("PrivacyNotice")}
            style={styles.gridItem}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
    backgroundColor: "#fffefdff",
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000ff",
  },
  card: { gap: 28, backgroundColor: "lightgrey" },
  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  flex: { flex: 1, borderRadius: 30, backgroundColor: "black" },
  gap: { width: 12 },
  secondary: { backgroundColor: "#f70808ff" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",

    color: "#000000ff",
  },
  grid: {
    flexDirection: "row",
    display: "contents",
    flexWrap: "wrap",
    gap: 32,
  },
  gridItem: {
    flexBasis: "13%",
    backgroundColor: "blue",
    display: "flex",
    borderRadius: 30,
  },
});
