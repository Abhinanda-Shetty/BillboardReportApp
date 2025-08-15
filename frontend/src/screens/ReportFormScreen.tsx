import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";
import Tag from "../components/Tag";

const VIOLATION_TYPES = [
  "Oversized",
  "Near Junction",
  "Obscene Content",
  "Rusted/Unsafe",
  "No License QR",
  "Wrong Location",
];

export default function ReportFormScreen({ navigation }: any) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (v: string) => {
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.label}>Violation Type(s)</Text>
        <View style={styles.tagsWrap}>
          {VIOLATION_TYPES.map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => toggle(v)}
              activeOpacity={0.85}
            >
              <Tag label={`${selected.includes(v) ? "✓ " : ""}${v}`} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          placeholder="Add any additional details..."
          placeholderTextColor="#94A3B8"
          style={styles.textArea}
          multiline
        />

        <Text style={styles.label}>Location (read-only in demo)</Text>
        <TextInput
          value="12.9716, 77.5946"
          editable={false}
          style={styles.input}
        />

        <PrimaryButton
          label="Send Report"
          onPress={() => navigation.navigate("History")}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F8FAFC" },
  card: { gap: 14 },
  label: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    color: "#0F172A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
});
