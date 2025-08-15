import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";
import Tag from "../components/Tag";

export default function DetectionResultScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format",
          }}
          style={styles.preview}
        />
        <View style={styles.tagRow}>
          <Tag label="⚠ Size > 20×10 ft" />
          <Tag label="Near Junction" />
          <Tag label="License Mismatch" />
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Location</Text>
            <Text style={styles.metaValue}>12.9716° N, 77.5946° E</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Timestamp</Text>
            <Text style={styles.metaValue}>2025-08-15 19:10</Text>
          </View>
        </View>
        <PrimaryButton
          label="Submit Report"
          onPress={() => navigation.navigate("ReportForm")}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Reason Summary</Text>
        <Text style={styles.body}>
          Detected billboard exceeds recommended dimensions and is placed close
          to a traffic junction. OCR indicates license code not found in sample
          dataset.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: "#F8FAFC" },
  card: { gap: 12 },
  preview: { height: 220, borderRadius: 12 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaRow: { flexDirection: "row", gap: 12 },
  metaBlock: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 12,
  },
  metaLabel: { fontSize: 12, color: "#475569" },
  metaValue: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  title: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  body: { fontSize: 14, color: "#334155", lineHeight: 20 },
});
