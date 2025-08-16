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
    backgroundColor: "#fffefdff",
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000ff",
    marginBottom: 16, // ✅ Replace gap with margin
  },
  card: {
    backgroundColor: "lightgrey",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16, // ✅ Replace gap with margin
  },
  row: {
    flexDirection: "row",
    marginTop: 12, // ✅ Removed gap
  },
  flex: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: "black",
  },
  gap: { width: 12 }, // ✅ Keep this - it's a spacer View
  secondary: { backgroundColor: "#f70808ff" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000ff",
    marginBottom: 12, // ✅ Add margin for spacing
  },
  grid: {
    flexDirection: "column",
    flexWrap: "wrap",
  },
  gridItem: {
    flexBasis: "23%",
    backgroundColor: "brown",
    borderRadius: 30,
    marginBottom: 2,
  },
});
