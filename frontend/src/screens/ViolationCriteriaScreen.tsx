import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Card from "../components/Card";
import Tag from "../components/Tag";

const ITEMS = [
  { title: "Size/Dimensions", desc: "> 20×10 ft is illegal." },
  {
    title: "Placement",
    desc: "Near junctions, sharp turns, low-visibility zones.",
  },
  {
    title: "Structural Condition",
    desc: "Rusted poles, loose boards, leaning frames.",
  },
  { title: "Content", desc: "Obscene, political, or false advertising." },
  {
    title: "License Verification",
    desc: "Missing QR code or mismatch with database.",
  },
];

export default function ViolationCriteriaScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {ITEMS.map((item) => (
        <Card key={item.title} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Tag label="Example" />
          </View>
          <Text style={styles.desc}>{item.desc}</Text>
        </Card>
      ))}
      <Card>
        <Text style={styles.tipTitle}>Output for AI/Logic</Text>
        <Text style={styles.tipText}>
          A clear list of violation types your AI model can reference.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#F8FAFC" },
  card: { gap: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontWeight: "800", color: "#0F172A", fontSize: 16 },
  desc: { color: "#334155" },
  tipTitle: { fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  tipText: { color: "#334155" },
});
