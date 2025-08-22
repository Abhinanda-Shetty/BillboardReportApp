import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["authToken", "currentUser"]);
    // Force app restart to show login screen
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to Billboard Reporter</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>📸 Detection & Reporting</Text>
        <Text style={styles.cardDescription}>
          Capture billboard violations using your camera or upload existing
          photos
        </Text>
        <View style={styles.buttonRow}>
          <PrimaryButton
            label="Open Camera"
            onPress={() => navigation.navigate("DetectionResult")}
            style={styles.primaryButton}
          />
          <PrimaryButton
            label="Quick Report"
            onPress={() => navigation.navigate("ReportForm")}
            style={[styles.primaryButton, styles.secondaryButton]}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>📊 Your Activity</Text>
        <View style={styles.statsGrid}>
          <PrimaryButton
            label="📋 Report History"
            onPress={() => navigation.navigate("History")}
            style={styles.gridButton}
          />
          <PrimaryButton
            label="🏆 Leaderboard"
            onPress={() => navigation.navigate("Leaderboard")}
            style={styles.gridButton}
          />
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>🎯 How it works</Text>
        <Text style={styles.infoText}>
          • Take photos of billboard violations{"\n"}• Our AI detects size,
          placement & compliance issues{"\n"}• Government officials review and
          verify reports{"\n"}• Track your impact on the leaderboard
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "600",
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: "#10B981",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  gridButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
  },
  infoCard: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
  },
});
