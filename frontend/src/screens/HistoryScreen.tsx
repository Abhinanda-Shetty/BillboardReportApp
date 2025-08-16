import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Card from "../components/Card";

const DATA = [
  {
    id: "RPT-1024",
    when: "2025-08-14 17:22",
    status: "Submitted",
    summary: "Oversized near junction",
  },
  {
    id: "RPT-1023",
    when: "2025-08-13 10:03",
    status: "Pending",
    summary: "No License QR",
  },
  {
    id: "RPT-1022",
    when: "2025-08-10 08:41",
    status: "Submitted",
    summary: "Obscene content flagged",
  },
];

export default function HistoryScreen({ navigation }: any) {
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("DetectionResult")}
        >
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.id}>{item.id}</Text>
              <Text
                style={[
                  styles.status,
                  item.status === "Pending" && styles.pending,
                ]}
              >
                {item.status}
              </Text>
            </View>
            <Text style={styles.summary}>{item.summary}</Text>
            <Text style={styles.when}>{item.when}</Text>
          </Card>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#F8FAFC" },
  card: { gap: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  id: { fontWeight: "800", color: "#0F172A" },
  status: { fontWeight: "700", color: "#16A34A" },
  pending: { color: "#CA8A04" },
  summary: { color: "#334155" },
  when: { fontSize: 12, color: "#64748B" },
});
