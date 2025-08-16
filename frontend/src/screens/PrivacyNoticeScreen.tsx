import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

export default function PrivacyNoticeScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Privacy Notice</Text>
        <Text style={styles.body}>
          This demo captures images and location for reporting. In this UI-only
          mock, no data leaves your device. For production, clearly communicate
          data use, retention period, and user rights.
        </Text>
        <PrimaryButton
          label="I Understand"
          onPress={() => navigation.goBack()}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F8FAFC" },
  card: { gap: 12 },
  title: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  body: { fontSize: 14, color: "#334155", lineHeight: 20 },
});
